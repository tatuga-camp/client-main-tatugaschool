import { Editor } from "@tinymce/tinymce-react";
import React, { memo } from "react";
import { TinyMCE } from "tinymce";
import { useGetLanguage } from "../../react-query";
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
  disabled?: boolean;
};
function TextEditor({
  value,
  onChange,
  schoolId,
  menubar = true,
  disabled = false,
  toolbar = "undo redo | formatselect | blocks | " +
    "bold italic backcolor | alignleft aligncenter " +
    "alignright alignjustify | bullist numlist outdent indent | " +
    "removeformat | image | link ",
}: Props) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const language = useGetLanguage();
  return (
    <>
      {!isLoaded && <span className="animate-pulse">Loading...</span>}
      <Editor
        // TinyMCE 8 disables the editor unless a license is stated.
        licenseKey="gpl"
        onInit={() => {
          setIsLoaded(true);
        }}
        tinymceScriptSrc={"/assets/libs/tinymce/tinymce.min.js"}
        value={value}
        onEditorChange={(content) => {
          onChange(content);
        }}
        disabled={disabled}
        init={{
          object_resizing: true,
          link_context_toolbar: true,
          height: "100%",
          width: "100%",
          menubar: menubar,
          toolbar: toolbar,
          // The text's language (lang on the editing area): screen readers
          // and the browser's spellcheck read it. Set once, as it mounts.
          content_language: language.data ?? "en",
          // Lists nest three levels deep at most (the option counts indents,
          // so 2): students read these on a phone, where deeper ones run off
          // the screen. Lists saved deeper are kept.
          list_max_depth: 2,
          // A new table starts with a header row, made of real header cells
          // (<thead> with <th>), so it looks and reads as one.
          table_default_header_rows: 1,
          table_header_type: "sectionCells",
          image_title: true,
          automatic_uploads: true,
          paste_data_images: false,
          smart_paste: true,
          branding: false,
          // TinyMCE's own "Upgrade" ad beside the menubar.
          promotion: false,
          file_picker_types: "image",

          file_picker_callback: async (callback, value, meta) => {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");

            input.addEventListener("change", async (e: any) => {
              const file: File = e.target.files[0];
              const signURL = await getSignedURLTeacherService({
                fileName: file.name,
                fileType: file.type,
                schoolId: schoolId,
                fileSize: file.size,
              });
              await UploadSignURLService({
                contentType: file.type,
                file: file,
                signURL: signURL.signURL,
              });
              callback(signURL.originalURL, { title: file.name });
            });

            input.click();
          },
          plugins: [
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
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
      />
    </>
  );
}

export default memo(TextEditor);
