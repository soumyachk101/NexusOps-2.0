import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.config import settings
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Handles JWT token creation/validation, password hashing, and GitHub OAuth."""

    # ── Password Hashing ──

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    # ── JWT Tokens ──

    @staticmethod
    def create_access_token(user_id: str, email: str) -> str:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": user_id,
            "email": email,
            "exp": expire,
            "type": "access",
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_REFRESH_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": user_id,
            "exp": expire,
            "type": "refresh",
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def decode_token(token: str) -> dict | None:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return payload
        except JWTError:
            return None

    def create_tokens(self, user: User) -> dict:
        user_id = str(user.id)
        access_token = self.create_access_token(user_id, user.email)
        refresh_token = self.create_refresh_token(user_id)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    # ── User Operations ──

    async def authenticate_user(self, db: AsyncSession, email: str, password: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user or not user.hashed_password:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user

    async def get_user_by_id(self, db: AsyncSession, user_id: str) -> User | None:
        result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        return result.scalar_one_or_none()

    async def get_user_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create_user(
        self,
        db: AsyncSession,
        email: str,
        name: str,
        password: str | None = None,
        provider: str = "credentials",
        github_id: str | None = None,
        github_username: str | None = None,
        github_access_token: str | None = None,
        google_id: str | None = None,
        google_access_token: str | None = None,
        avatar_url: str | None = None,
    ) -> User:
        user = User(
            email=email,
            name=name,
            hashed_password=self.hash_password(password) if password else None,
            provider=provider,
            github_id=github_id,
            github_username=github_username,
            github_access_token=github_access_token,
            google_id=google_id,
            google_access_token=google_access_token,
            avatar_url=avatar_url,
        )
        db.add(user)
        await db.flush()
        return user


    # ── Firebase Auth ──
    async def verify_firebase_id_token(self, id_token: str) -> dict:
        """Verify Firebase ID token using Google Identity Toolkit."""
        if not settings.FIREBASE_WEB_API_KEY:
            raise ValueError("Firebase auth is not configured")

        url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={settings.FIREBASE_WEB_API_KEY}"
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json={"idToken": id_token})

        if response.status_code != 200:
            raise ValueError("Invalid Firebase token")

        payload = response.json()
        users = payload.get("users") or []
        if not users:
            raise ValueError("Invalid Firebase token")

        firebase_user = users[0]
        email = firebase_user.get("email")
        if not email:
            raise ValueError("Firebase account is missing email")

        return {
            "firebase_id": firebase_user.get("localId"),
            "email": email,
            "name": firebase_user.get("displayName") or email.split("@")[0],
            "avatar_url": firebase_user.get("photoUrl"),
        }

    async def get_or_create_firebase_user(self, db: AsyncSession, firebase_data: dict) -> User:
        """Find user by email for Firebase auth, or create new one."""
        result = await db.execute(select(User).where(User.email == firebase_data["email"]))
        user = result.scalar_one_or_none()

        if user:
            if user.provider == "credentials":
                user.provider = "firebase"
            if not user.name and firebase_data.get("name"):
                user.name = firebase_data["name"]
            if not user.avatar_url and firebase_data.get("avatar_url"):
                user.avatar_url = firebase_data["avatar_url"]
            await db.flush()
            return user

        return await self.create_user(
            db,
            email=firebase_data["email"],
            name=firebase_data.get("name") or firebase_data["email"].split("@")[0],
            provider="firebase",
            avatar_url=firebase_data.get("avatar_url"),
        )

    # ── Google OAuth ──
    async def exchange_google_token(self, access_token: str) -> dict:
        """Fetch Google user info using the access token."""
        async with httpx.AsyncClient() as client:
            user_resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if user_resp.status_code != 200:
                raise ValueError(f"Google OAuth failed: {user_resp.text}")
            
            google_user = user_resp.json()
            return {
                "access_token": access_token,
                "google_id": str(google_user["sub"]),
                "email": google_user.get("email"),
                "name": google_user.get("name"),
                "avatar_url": google_user.get("picture"),
            }

    async def get_or_create_google_user(self, db: AsyncSession, google_data: dict) -> User:
        """Find user by Google ID or email, or create new one."""
        # Check by Google ID
        result = await db.execute(
            select(User).where(User.google_id == google_data["google_id"])
        )
        user = result.scalar_one_or_none()
        if user:
            # Update token
            user.google_access_token = google_data["access_token"]
            user.avatar_url = google_data.get("avatar_url")
            await db.flush()
            return user

        # Check by email
        if google_data.get("email"):
            result = await db.execute(
                select(User).where(User.email == google_data["email"])
            )
            user = result.scalar_one_or_none()
            if user:
                # Link Google to existing account
                user.google_id = google_data["google_id"]
                user.google_access_token = google_data["access_token"]
                user.avatar_url = google_data.get("avatar_url")
                if user.provider == "credentials":
                    user.provider = "google"
                await db.flush()
                return user

        # Create new user
        return await self.create_user(
            db,
            email=google_data["email"],
            name=google_data["name"],
            provider="google",
            avatar_url=google_data.get("avatar_url"),
        )
        
    # ── GitHub OAuth ──

    async def exchange_github_token(self, access_token: str) -> dict:
        """Fetch GitHub user info using the provided access token."""
        async with httpx.AsyncClient() as client:
            # Step 1: Fetch user info
            user_resp = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if user_resp.status_code != 200:
                raise ValueError(f"GitHub OAuth failed: {user_resp.text}")
            
            github_user = user_resp.json()

            # Step 2: Fetch primary email
            email_resp = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            emails = email_resp.json() if email_resp.status_code == 200 else []
            primary_email = next(
                (e["email"] for e in emails if e.get("primary")),
                github_user.get("email"),
            )

            return {
                "access_token": access_token,
                "github_id": str(github_user["id"]),
                "github_username": github_user.get("login"),
                "email": primary_email,
                "name": github_user.get("name") or github_user.get("login"),
                "avatar_url": github_user.get("avatar_url"),
            }

    async def get_or_create_github_user(self, db: AsyncSession, github_data: dict) -> User:
        """Find user by GitHub ID or email, or create new one."""
        # Check by GitHub ID
        result = await db.execute(
            select(User).where(User.github_id == github_data["github_id"])
        )
        user = result.scalar_one_or_none()
        if user:
            # Update token
            user.github_access_token = github_data["access_token"]
            user.avatar_url = github_data.get("avatar_url")
            await db.flush()
            return user

        # Check by email
        if github_data.get("email"):
            result = await db.execute(
                select(User).where(User.email == github_data["email"])
            )
            user = result.scalar_one_or_none()
            if user:
                # Link GitHub to existing account
                user.github_id = github_data["github_id"]
                user.github_username = github_data["github_username"]
                user.github_access_token = github_data["access_token"]
                user.avatar_url = github_data.get("avatar_url")
                user.provider = "github"
                await db.flush()
                return user

        # Create new user
        return await self.create_user(
            db,
            email=github_data["email"],
            name=github_data["name"],
            provider="github",
            github_id=github_data["github_id"],
            github_username=github_data["github_username"],
            github_access_token=github_data["access_token"],
            avatar_url=github_data.get("avatar_url"),
        )


auth_service = AuthService()
