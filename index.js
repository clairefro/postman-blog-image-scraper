/** Code mostly generated with ChatGPT ;)  */
import fetch from "node-fetch";
import { load } from "cheerio";
import fs from "fs";
import path from "path";

const outputDir = "./images"; // local dir to save images

const fetchImages = async (imageUrl, outpath) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(
        `Unexpected response status ${response.status} ${response.statusText}`
      );
    }
    const fileStream = fs.createWriteStream(outpath);
    response.body.pipe(fileStream);
    await new Promise((resolve, reject) => {
      fileStream.on("finish", resolve);
      fileStream.on("error", reject);
    });
    console.log(`Downloaded ${imageUrl} to ${outpath}`);
  } catch (error) {
    console.error(`Error downloading ${imageUrl}:`, error);
  }
};

const downloadBlogImages = async (url) => {
  console.log({ url });
  try {
    const response = await fetch(url);

    const html = await response.text();
    const $ = load(html);

    /** Postman blog thumbnails use class .squared-up-thumbnail  */
    $(".squared-up-thumbnail").each(async (_i, el) => {
      const thumbnailStyleAttr = $(el).attr("style");
      // get url from style attribute background-image: url(<url>)
      const imageUrl = thumbnailStyleAttr.match(/url\((.*?)\)/)[1];
      if (!imageUrl) {
        return;
      }

      // Make outdir if not exist
      if (!fs.existsSync(path.resolve(outputDir))) {
        fs.mkdirSync(path.resolve(outputDir));
        console.log(`Created outdir: ${outputDir}`);
      } else {
        console.log(`Outdir: ${outputDir} already exists`);
      }

      // Generate a filename for the image based on its URL
      const filename = imageUrl.split("/").pop();
      const outputPath = path.join(path.resolve(outputDir), filename);

      // Download the image and save it to the output directory
      try {
        const imageResponse = await fetchImages(imageUrl, outputPath);
        if (!imageResponse.ok) {
          throw new Error(
            `Unexpected response status ${imageResponse.status} ${imageResponse.statusText}`
          );
        }
        const fileStream = fs.createWriteStream(outputPath);
        response.body.pipe(fileStream);
        await new Promise((resolve, reject) => {
          fileStream.on("finish", resolve);
          fileStream.on("error", reject);
        });
        console.log(`Saved ${imageUrl} to ${outputPath}`);
      } catch (err) {
        console.error(`Error downloading ${imageUrl}:`, err);
      }
    });
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
  }
};

const run = () => {
  const baseUrl = `https://blog.postman.com/postspage/page/`;

  /** iterate through 65 pages - styles get old around here */
  for (let i = 0; i < 65; i++) {
    const url = baseUrl + (i + 1);
    downloadBlogImages(url);
  }
};

run();
