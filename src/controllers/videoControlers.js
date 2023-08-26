import { fileURLToPath } from "url";
import path from "path";
import ytdl from "ytdl-core";
import fs from "fs";

process.env.YTDL_NO_UPDATE = "true";

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
    const image = info.videoDetails.thumbnails[0].url;
    const durationMinutes = Math.floor(info.videoDetails.lengthSeconds / 60);
    const author = info.videoDetails.author.name;
    res
      .status(200)
      .send({
        title: title,
        image: image,
        durationMinutes: durationMinutes,
        author: author,
      });
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

    stream.on("end", () => {
      audioWriteStream.end(); 

      const fileStream = fs.createReadStream(audioPath);
      
      const sanitizedTitle = title.replace(/[^\w\s.-]/g, "_");
      const disposition = `attachment; filename="${encodeURIComponent(sanitizedTitle)}.mp3"`;
      res.setHeader("Content-Disposition", disposition);
      res.setHeader("Content-Type", "audio/mpeg");
      
      fileStream.pipe(res);
      
      fileStream.on("end", () => {
        fs.unlinkSync(audioPath);
        console.log("File deleted:", audioPath);
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal error");
  }
};
