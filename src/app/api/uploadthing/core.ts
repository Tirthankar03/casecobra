import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from 'zod';
//shift + alt + o => remove unused imports
import sharp from 'sharp'
import { db } from "@/app/db";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .input(z.object({ configId: z.string().optional() }))
    .middleware(async ({ input }) => {
        return { input }
     
    })
    .onUploadComplete(async ({ metadata, file }) => {

      
        const { configId } = metadata.input //something that you get from frontend

        console.log('file after upload>>>>>>>', file);
        

        const res = await fetch(file.url)

        console.log('res from the fetch, idk why is it being done>>>>>', res);

        const buffer = await res.arrayBuffer()
        
        const imgMetadata = await sharp(buffer).metadata()
       
        const { width, height, } = imgMetadata  

        if (!configId) {
              const configuration = await db.configuration.create({
                data: {
                  imageUrl: file.url,
                  height: height || 500,
                  width: width || 500,
                },
              })

              return { configId: configuration.id }
            } else {
                  const updatedConfiguration = await db.configuration.update({
                    where: {
                      id: configId,
                    },
                    data: {
                      croppedImageUrl: file.url,
                    },
                  })
          
                  return { configId: updatedConfiguration.id }
                }
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;