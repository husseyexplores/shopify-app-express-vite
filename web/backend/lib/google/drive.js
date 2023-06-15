import { getDrive } from "./oauth.js";
import { createXlxs } from './create-xlxs.js'

/** @typedef {Awaited<ReturnType<typeof getDrive>>} drive */

/**
 * @param {drive} drive
 * @param {string} folderName
 */
async function getFolderId(drive, folderName) {
  // Check if the folder already exists
  const response = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id)",
    spaces: "drive",
  });

  if (response.data.files.length > 0) {
    console.log("Folder already exists");
    return response.data.files[0].id;
  }

  // Folder does not exist, create a new folder
  const fileMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };

  const folder = await drive.files
    .create({
      resource: fileMetadata,
      fields: "id",
    })
    .then((x) => x);

  console.log("Folder created");
  return folder.data.id;
}

/**
 * @param {drive} drive
 */
async function getFileNames(drive) {
  try {
    const response = await drive.files.list({
      fields: "files(name)",
      pageSize: 1000, // Change this as needed
    });

    const files = response.data.files;
    if (files.length) {
      console.log("File names:");
      files.forEach((file) => {
        console.log(file.name);
      });
      return files;
    } else {
      console.log("No files found.");
    }
  } catch (error) {
    console.error("Error retrieving file names:", error);
  }
}

/**
 * @param {drive} drive
 * @param {string} [parentFolderId]
 */
async function createAndUploadFile(drive, parentFolderId) {
  try {
    const response = await drive.files
      .create({
        requestBody: {
          name: "test-file-from-app.txt",
          parents: parentFolderId ? [parentFolderId] : undefined,
          mimeType: "text/plain",
        },
        media: {
          mimeType: "text/plain",
          body: "This is a test file. 333", // Change the file content as needed,
        },
        fields: "id",
      })
      .then((x) => {
        return x;
      });

    console.log(
      "File created and uploaded successfully. File ID:",
      response.data.id
    );
  } catch (error) {
    console.error("Error creating and uploading the file:", error);
  }
}

async function main() {
  const {drive, sheets} = await getDrive();

  // const folderId = await getFolderId(drive, "n74-custom-reports");


  // await getFileNames(drive);
  // await createAndUploadFile(drive, folderId);

  await createXlxs(sheets);
}
main();
