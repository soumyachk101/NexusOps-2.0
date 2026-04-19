"""GitHub service: fetch code context and create draft PRs for AI fixes."""
from datetime import datetime, timezone
from typing import Optional


class GitHubService:

    @staticmethod
    def _get_client(token: str):
        from github import Github
        return Github(token)

    @staticmethod
    async def fetch_code_context(
        full_name: str,
        affected_files: list[str],
        stack_trace: str,
        token: str,
        max_chars: int = 6000,
    ) -> str:
        """Fetch relevant source code from GitHub for the AI fix generator.

        Returns concatenated file contents, capped at max_chars.
        """
        if not token or not full_name:
            return ""

        try:
            g = GitHubService._get_client(token)
            repo = g.get_repo(full_name)
            collected = []
            total_chars = 0

            # Try explicitly affected files first
            for path in affected_files[:5]:
                if total_chars >= max_chars:
                    break
                try:
                    file_content = repo.get_contents(path)
                    code = file_content.decoded_content.decode("utf-8", errors="ignore")
                    snippet = f"=== {path} ===\n{code[:2000]}\n"
                    collected.append(snippet)
                    total_chars += len(snippet)
                except Exception:
                    pass

            # Try to infer files from stack trace lines
            if total_chars < max_chars and stack_trace:
                import re
                # Match Python: File "path/to/file.py", line N
                py_files = re.findall(r'File "([^"]+\.py)"', stack_trace)
                # Match JS/TS: at ... (path/to/file.ts:N:N)
                js_files = re.findall(r'\(([^\)]+\.[jt]sx?):[\d]+:[\d]+\)', stack_trace)
                inferred = list(dict.fromkeys(py_files + js_files))

                for path in inferred[:3]:
                    if total_chars >= max_chars:
                        break
                    if path in affected_files:
                        continue
                    try:
                        clean_path = path.lstrip("/")
                        file_content = repo.get_contents(clean_path)
                        code = file_content.decoded_content.decode("utf-8", errors="ignore")
                        snippet = f"=== {clean_path} ===\n{code[:2000]}\n"
                        collected.append(snippet)
                        total_chars += len(snippet)
                    except Exception:
                        pass

            return "\n".join(collected)

        except Exception as e:
            print(f"GitHub code fetch error: {e}")
            return ""

    @staticmethod
    async def create_draft_pr(
        full_name: str,
        token: str,
        incident_id: str,
        fix_title: str,
        fix_explanation: str,
        file_changes: list[dict],
        memory_summary: str = "",
        base_branch: str = "main",
    ) -> dict:
        """Create a DRAFT pull request with the AI-generated fix.

        - Creates a new branch: nexusops/fix-{incident_short_id}
        - Commits file changes (if any)
        - Opens a DRAFT PR with full context + memory enrichment section
        - NEVER auto-merges

        Returns: {"pr_url": str, "pr_number": int, "branch": str}
        """
        if not token or not full_name:
            return {"pr_url": None, "pr_number": None, "branch": None, "error": "No GitHub token"}

        try:
            import base64
            g = GitHubService._get_client(token)
            repo = g.get_repo(full_name)

            incident_short = incident_id[:8]
            branch_name = f"nexusops/fix-{incident_short}"
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")

            # Create branch from base
            base_ref = repo.get_branch(base_branch)
            try:
                repo.create_git_ref(
                    ref=f"refs/heads/{branch_name}",
                    sha=base_ref.commit.sha,
                )
            except Exception:
                # Branch may already exist — append timestamp
                branch_name = f"nexusops/fix-{incident_short}-{timestamp}"
                repo.create_git_ref(
                    ref=f"refs/heads/{branch_name}",
                    sha=base_ref.commit.sha,
                )

            # Commit file changes
            committed_files = []
            for change in file_changes[:3]:  # max 3 files per docs
                path = change.get("path", "")
                fixed_code = change.get("fixed_code", "")
                if not path or not fixed_code:
                    continue
                try:
                    # Try to get existing file SHA for update
                    try:
                        existing = repo.get_contents(path, ref=branch_name)
                        repo.update_file(
                            path=path,
                            message=f"fix({path}): {change.get('change_summary', 'NexusOps AI fix')}",
                            content=fixed_code,
                            sha=existing.sha,
                            branch=branch_name,
                        )
                    except Exception:
                        # File doesn't exist yet — create it
                        repo.create_file(
                            path=path,
                            message=f"fix({path}): {change.get('change_summary', 'NexusOps AI fix')}",
                            content=fixed_code,
                            branch=branch_name,
                        )
                    committed_files.append(path)
                except Exception as e:
                    print(f"Could not commit {path}: {e}")

            # Build PR body
            files_section = ""
            if committed_files:
                files_section = "\n".join(f"- `{f}`" for f in committed_files)
            elif file_changes:
                files_section = "\n".join(f"- `{c.get('path', '?')}` (manual review needed)" for c in file_changes[:3])
            else:
                files_section = "_No specific files identified — see analysis above_"

            memory_section = ""
            if memory_summary:
                memory_section = (
                    "\n## 🧠 Team Memory Context\n"
                    "> This fix was enriched with context from your team's knowledge base.\n\n"
                    f"{memory_summary}\n"
                )

            pr_body = (
                f"## 🤖 NexusOps AutoFix — Incident `{incident_short}`\n\n"
                f"### Analysis\n{fix_explanation}\n\n"
                f"### Files Changed\n{files_section}\n"
                f"{memory_section}\n"
                "---\n"
                "> ⚠️ **This is a DRAFT PR.** Review all changes carefully before merging.\n"
                "> Generated by [NexusOps AutoFix](https://nexusops.dev) — always requires human approval.\n"
            )

            pr = repo.create_pull(
                title=f"[NexusOps] {fix_title}",
                body=pr_body,
                head=branch_name,
                base=base_branch,
                draft=True,
            )

            return {
                "pr_url": pr.html_url,
                "pr_number": pr.number,
                "branch": branch_name,
            }

        except Exception as e:
            print(f"GitHub PR creation error: {e}")
            return {"pr_url": None, "pr_number": None, "branch": None, "error": str(e)}


github_service = GitHubService()
