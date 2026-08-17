import React, { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { IoMdClose } from "react-icons/io";
import { MdOutlineRotate90DegreesCcw } from "react-icons/md";
import { createCroppedPhotoFile } from "../../utils";
import LoadingBar from "./LoadingBar";

type Area = { x: number; y: number; width: number; height: number };

type Props = {
  file: File;
  onClose: () => void;
  onSave: (file: File) => Promise<void> | void;
};

// Modal to crop and rotate a student photo before upload. Renders its own
// fixed overlay (instead of PopupLayout) so it can stack inside other popups
// without touching document.body overflow.
function PhotoEditor({ file, onClose, onSave }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [quarterTurns, setQuarterTurns] = useState(0);
  const [fineRotation, setFineRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const rotation = quarterTurns * 90 + fineRotation;
  // Create and revoke the object URL in the same effect so every mount owns
  // its own URL — StrictMode's mount/cleanup/mount cycle would otherwise
  // revoke a URL that is still in use.
  const [imageSrc, setImageSrc] = useState("");
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSave = async () => {
    try {
      if (!croppedAreaPixels || !imageSrc) return;
      setSaving(true);
      const croppedFile = await createCroppedPhotoFile({
        imageSrc,
        pixelCrop: croppedAreaPixels,
        rotation,
        fileName: file.name,
      });
      await onSave(croppedFile);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 font-Anuphan">
      <div className="m-3 flex w-full max-w-md flex-col gap-3 rounded-2xl bg-white p-4">
        {saving && <LoadingBar />}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Adjust Photo</h2>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
          >
            <IoMdClose />
          </button>
        </div>
        <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-gray-900">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, areaPixels) =>
                setCroppedAreaPixels(areaPixels)
              }
            />
          )}
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            disabled={saving}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="accent-primary-color"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">Straighten</span>
          <input
            type="range"
            min={-45}
            max={45}
            step={1}
            value={fineRotation}
            disabled={saving}
            onChange={(e) => setFineRotation(Number(e.target.value))}
            className="accent-primary-color"
          />
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={() => setQuarterTurns((prev) => (prev + 3) % 4)}
          className="second-button flex w-max items-center justify-center gap-1 border"
        >
          <MdOutlineRotate90DegreesCcw />
          Rotate 90°
        </button>
        <div className="flex justify-end gap-3 border-t pt-3">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="second-button flex items-center justify-center gap-1 border"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !croppedAreaPixels}
            onClick={handleSave}
            className="main-button flex items-center justify-center gap-1"
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}

export default PhotoEditor;
