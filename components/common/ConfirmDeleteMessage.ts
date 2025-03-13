import Swal from "sweetalert2";
import { requestData } from "../../data/languages";
import { Language } from "../../interfaces";

async function ConfirmDeleteMessage(data: {
  language: Language;
  callback: () => Promise<void>;
}) {
  const replacedText = "DELETE";
  let content = document.createElement("div");
  content.innerHTML =
    `<div>${requestData.deleteInstruction1(data.language)}<strong>` +
    replacedText +
    `  </strong>${requestData.deleteInstruction2(data.language)}</div>`;
  const { value } = await Swal.fire({
    title: requestData.deleteTitle(data.language),
    input: "text",
    icon: "warning",
    footer: requestData.deleteFooter(data.language),
    html: content,
    showCancelButton: true,
    inputValidator: (value) => {
      if (value !== replacedText) {
        return requestData.deleteError(data.language);
      }
    },
  });
  if (value) {
    await data.callback();
  }
}

export default ConfirmDeleteMessage;
