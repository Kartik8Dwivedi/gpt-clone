
import formidable from "formidable";
import { Readable } from "stream";

export async function parseForm(
  request: Request
): Promise<{ fields: any; files: any }> {
  const form = formidable({ multiples: true });

  const contentType = request.headers.get("content-type");

  if (!contentType?.startsWith("multipart/form-data")) {
    throw new Error("Invalid content type, expected multipart/form-data");
  }

  if (!request.body) {
    throw new Error("Request body is missing");
  }

  const reader = request.body.getReader();
  const req = new Readable({
    read() {
      reader.read().then(({ done, value }) => {
        if (done) {
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      }).catch(err => this.destroy(err));
    },
  });

  // @ts-ignore
  req.headers = Object.fromEntries(request.headers.entries());

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const maxBodySize = "20mb";

