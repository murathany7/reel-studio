# Homebrew formula for the murathany7/homebrew-reel-studio tap. Installs the npm package with its own Node.
# After `npm publish`, run packaging/update-formula.sh to set url and sha256, then copy this file to the tap's Formula/.
class ReelStudio < Formula
  desc "Make marketing reels, ads and posts with code, for any brand, with Claude Code"
  homepage "https://github.com/murathany7/reel-studio"
  url "https://registry.npmjs.org/reel-studio/-/reel-studio-0.2.1.tgz"
  sha256 "e6f9830c03ba5745af729feb50a97376079db8071dcf5bb4f978201d97e9f2fd"
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
