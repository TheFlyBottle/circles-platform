import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Route for promotion images
  imageUploader: f({ 
    image: { 
      maxFileSize: "4MB",
      maxFileCount: 1
    } 
  })
    .middleware(async ({ req }) => {
      return { };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Image upload complete:", file.url);
      return { url: file.url };
    }),

  // Route for syllabus and shared files
  fileUploader: f({ 
    blob: { 
      maxFileSize: "8MB",
      maxFileCount: 1
    } 
  })
    .middleware(async ({ req }) => {
      return { };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("File upload complete:", file.url);
      return { 
        url: file.url,
        name: file.name,
        size: file.size,
        type: file.type
      };
    }),
};
