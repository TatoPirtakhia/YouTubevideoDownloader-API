import ytdl from "ytdl-core";

process.env.YTDL_NO_UPDATE = "true";

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
    res.status(200).send({
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

    const stream = ytdl(videoUrl, options);

    const audioChunks = [];
    stream.on("data", (chunk) => {
      audioChunks.push(chunk);
    });

    stream.on("end", async () => {
      const audioBuffer = Buffer.concat(audioChunks);

      const sanitizedTitle = title.replace(/[^\w\s.-]/g, "_");

      const disposition = `attachment; filename="${encodeURIComponent(
        sanitizedTitle
      )}.mp3"`;
      res.setHeader("Content-Disposition", disposition);
      res.setHeader("Content-Type", "audio/mpeg");
      res.send(audioBuffer);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal error");
  }
};
