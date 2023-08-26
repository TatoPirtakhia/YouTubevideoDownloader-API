import { fileURLToPath } from "url";
import path from "path";
import ytdl from "ytdl-core";
import fs from "fs";

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
    console.log('1')
    const audioPath = path.join(tempDirectory, `${title}.mp3`);
    console.log('2')
    const audioWriteStream = fs.createWriteStream(audioPath);
    console.log('3')
    const stream = ytdl(videoUrl, options);
    console.log('4')
    stream.pipe(audioWriteStream);
    console.log('5')
    stream.on("finish", () => {
      console.log('6')
      const fileStream = fs.createReadStream(audioPath);
      console.log('7')
      res.setHeader("Content-Disposition", `attachment; filename="${title}.mp3"`);
      console.log('8')
      res.setHeader("Content-Type", "audio/mpeg");
      console.log('9')
      fileStream.pipe(res);
      console.log('10')
      fileStream.on("end", () => {
        fs.unlinkSync(audioPath);
        console.log('File deleted:', audioPath);
      });
      console.log('11')
    });
    console.log('12')
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal error");
  }
};
