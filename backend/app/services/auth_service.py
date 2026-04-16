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
            avatar_url=avatar_url,
        )
        db.add(user)
        await db.flush()
        return user

    # ── GitHub OAuth ──

    async def exchange_github_code(self, code: str) -> dict:
        """Exchange GitHub OAuth code for access token + user info."""
        async with httpx.AsyncClient() as client:
            # Step 1: Exchange code for token
            token_resp = await client.post(
                "https://github.com/login/oauth/access_token",
                json={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": code,
                },
                headers={"Accept": "application/json"},
            )
            token_data = token_resp.json()
            access_token = token_data.get("access_token")
            if not access_token:
                raise ValueError(f"GitHub OAuth failed: {token_data}")

            # Step 2: Fetch user info
            user_resp = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            github_user = user_resp.json()

            # Step 3: Fetch primary email
            email_resp = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            emails = email_resp.json()
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
