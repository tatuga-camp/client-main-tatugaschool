import { Editor } from "@tinymce/tinymce-react";
import React, { memo } from "react";
import { TinyMCE } from "tinymce";
import {
  getSignedURLTeacherService,
  UploadSignURLService,
} from "../../services";

declare const tinymce: TinyMCE;
type Props = {
  value: string;
  onChange: (content: string) => void;
  menubar?: boolean;
  toolbar?: boolean | string;
  schoolId: string;
};
function TextEditor({
  value,
  onChange,
  schoolId,
  menubar = true,
  toolbar = "undo redo | formatselect | blocks | " +
    "bold italic backcolor | alignleft aligncenter " +
    "alignright alignjustify | bullist numlist outdent indent | " +
    "removeformat | image | link ",
}: Props) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  return (
    <>
      {!isLoaded && <span className="animate-pulse">Loading...</span>}
      <Editor
        onInit={() => {
          setIsLoaded(true);
        }}
        tinymceScriptSrc={"/assets/libs/tinymce/tinymce.min.js"}
        value={value}
        onEditorChange={(content) => {
          onChange(content);
        }}
        init={{
          object_resizing: true,
          link_context_toolbar: true,
          height: "100%",
          width: "100%",
          menubar: menubar,
          toolbar: toolbar,
          image_title: true,
          automatic_uploads: true,
          paste_data_images: false,
          smart_paste: true,
          branding: false,
          file_picker_types: "image",

          file_picker_callback: async (callback, value, meta) => {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");

            input.addEventListener("change", async (e: any) => {
              const file: File = e.target.files[0];
              const blobUrl = URL.createObjectURL(file);
              const signURL = await getSignedURLTeacherService({
                fileName: file.name,
                fileType: file.type,
                schoolId: schoolId,
              });
              const upload = await UploadSignURLService({
                contentType: file.type,
                file: file,
                signURL: signURL.signURL,
              });
              callback(signURL.originalURL, { title: file.name });
            });

            input.click();
          },
          plugins: [
            "contextmenu",
            "advlist",
            "autolink",
            "lists",
            "link",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "image",
            "wordcount",
          ],
          contextmenu:
            "paste | link  inserttable | cell row column deletetable",

          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
      />
    </>
  );
}

export default memo(TextEditor);
