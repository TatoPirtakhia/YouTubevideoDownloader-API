import { fileURLToPath } from "url";
import path from "path";
import ytdl from "ytdl-core";
import fs from "fs";

// Disable update check for ytdl-core
process.env.YTDL_NO_UPDATE = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDirectory = path.join(__dirname, "temp");

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
    res.status(500).send("Error fetching title");
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

    const audioPath = path.join(tempDirectory, `${title}.mp3`);
    const audioWriteStream = fs.createWriteStream(audioPath);

    const stream = ytdl(videoUrl, options);
    stream.pipe(audioWriteStream);

    audioWriteStream.on("finish", () => {
      const fileStream = fs.createReadStream(audioPath);
      
      res.setHeader("Content-Disposition", `attachment; filename="${title}.mp3"`);
      res.setHeader("Content-Type", "audio/mpeg");
      
      fileStream.pipe(res);
      
      fileStream.on("end", () => {
        fs.unlinkSync(audioPath);
        console.log('File deleted:', audioPath);
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal error");
  }
};
