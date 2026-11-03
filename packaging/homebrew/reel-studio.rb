# Homebrew formula for the murathany7/homebrew-reel-studio tap. Installs the npm package with its own Node.
# After `npm publish`, run packaging/update-formula.sh to set url and sha256, then copy this file to the tap's Formula/.
class ReelStudio < Formula
  desc "Agency-quality marketing reels, ads and posts made by Claude Code"
  homepage "https://github.com/murathany7/reel-studio"
  url "https://registry.npmjs.org/reel-studio/-/reel-studio-0.2.5.tgz"
  sha256 "b618ef2e78546e31b552b6280283ceada591bb10ebdd5fa91e0a0846f4c6c09c"
  license "MIT"

  depends_on "ffmpeg"
  depends_on "node"

  on_linux do
    depends_on "rsync"
  end

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink libexec.glob("bin/*")
  end

  def caveats
    <<~EOS
      Rendering also needs Google Chrome (or set CHROME_PATH). Blender is optional, for 3D plates.
      Start a project with:
        reel-studio init
    EOS
  end

  test do
    assert_match "Reel Studio", shell_output("#{bin}/reel-studio help")
    system bin/"reel-studio", "init", testpath/"proj"
    assert_path_exists testpath/"proj/core/render.mjs"
    assert_path_exists testpath/"proj/.claude/skills/make-video/SKILL.md"
  end
end
