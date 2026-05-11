# upload-video

Downloads a seminar recording from YouTube and uploads it to the remote server.

## Requirements

- `yt-dlp` — `brew install yt-dlp`
- SSH access to `rtime` configured in `~/.ssh/config`

## Setup

Symlink the script into your PATH:

```bash
ln -s /path/to/scheduling-seminar/scripts/upload-video ~/bin/upload-video
```

## Usage

```bash
upload-video <youtube-url>
```

It will:
1. Fetch the video's upload date and title from YouTube
2. Download the video to `~/Downloads/` with the correct filename format: `YY_MM_DD_Speaker (Affiliation)_Title.mp4`
3. List existing folders on the remote server and ask where to upload it

## Remote server

Files are uploaded to `/var/www/scheduling-seminar/html/videos/<folder>` on `rtime`.