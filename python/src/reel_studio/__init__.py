"""Reel Studio: marketing videos made with code, run by Claude Code."""

from importlib.metadata import PackageNotFoundError, version

try:
    __version__ = version("reel-studio")
except PackageNotFoundError:
    __version__ = "0.0.0"
