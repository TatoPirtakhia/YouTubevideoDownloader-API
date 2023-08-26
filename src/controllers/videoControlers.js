import ytdl from "ytdl-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const getTitle = async (req, res) => {
  try {
    const videoUrl = req.body.link;
    if (!ytdl.validateURL(videoUrl))
      return res.status(500).send("Invalid URL!");

    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title;
    res.status(200).send(title);
  } catch (error) {
    console.log(error);
  }
};

export const downloadMusic = async (req, res) => {
  try {
    const videoUrl = req.body.link;
    if (!ytdl.validateURL(videoUrl))
      return res.status(500).send("Invalid URL!");

    const options = {
      quality: "highestaudio",
      filter: "audioonly",
    };
    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title;

    const modulePath = fileURLToPath(import.meta.url);
    const audioPath = path.join(
      path.dirname(modulePath),
      "temp",
      `${title}.mp3`
    );
    const audioWriteStream = fs.createWriteStream(audioPath);

    const stream = ytdl(videoUrl, options);
    stream.pipe(audioWriteStream);

    audioWriteStream.on("finish", () => {
      res.status(200).download(audioPath, `${title}.mp3`, () => {
        fs.unlinkSync(audioPath);
        console.log('finish')
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal error");
  }
};
