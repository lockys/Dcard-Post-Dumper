# Dcard Post Dumper

Usage:
==
- Dump posts of [Dcard](https://www.dcard.tw/) and save it in JSON Format.
- You can optionally upload this post to AWS S3.

Get started:
==
```
$ git clone https://github.com/lockys/Dcard-Post-Dumper.git
$ cd Dcard-Post-Dumper
$ node index.js
Dcard post dumper
1.0.0 alpha edition @ 2015/07/17
[*] I wake up, getting posts now.
[!] Latest Post ID is 384947
```
Upload to S3:
==
Specify your credential id and key of AWS S3 in **s3-setting.js** and DO NOT forget to create a bucket for your posts.
```
# eanble the functionality of uploading to S3
$ node index.js -s <bucket-name> 
```
LICENCE:
==
MIT
