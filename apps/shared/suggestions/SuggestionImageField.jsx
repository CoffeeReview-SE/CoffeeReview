import React, { useEffect, useRef, useState } from "react";
import { imageText, readImageFile } from "./suggestionImages.mjs";

export default function SuggestionImageField({ name, value, onChange, onError, onReadingChange, language, invalid, disabled = false }) {
  const [reading, setReading] = useState(false);
  const requestId = useRef(0);
  const inputRef = useRef(null);
  const uploaded = value.startsWith("data:");
  const text = key => imageText(language, key);
  useEffect(() => () => { requestId.current += 1; }, []);
  useEffect(() => {
    onReadingChange(reading);
    return () => onReadingChange(false);
  }, [reading]);

  const chooseFile = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const id = ++requestId.current;
    setReading(true);
    try {
      const data = await readImageFile(file);
      if (id === requestId.current) onChange(data);
    } catch (error) {
      if (id === requestId.current) onError(["imageSize", "imageType"].includes(error.message) ? error.message : "imageReadError");
    } finally {
      if (id === requestId.current) setReading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return <div className="sg-image-field">
    <label className="sg-image-choose" htmlFor={`${name}-file`}>{text("chooseImage")}</label>
    <input ref={inputRef} id={`${name}-file`} type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile} disabled={disabled} aria-describedby={`${name}-hint`} />
    <small id={`${name}-hint`}>{text("imageHint")}</small>
    {reading && <small role="status">{text("imageReading")}</small>}
    {uploaded ? <>
      <img className="sg-image-preview" src={value} alt={text("chooseImage")} />
      {!disabled && <button type="button" onClick={() => { requestId.current += 1; setReading(false); onChange(""); }}>{text("removeImage")}</button>}
      <input type="hidden" name={name} value={value} />
    </> : <>
      <label htmlFor={name}>{text("imageOrUrl")}</label>
      <input id={name} name={name} type="url" value={value} maxLength={2000} placeholder="https://..." readOnly={disabled} onChange={event => { requestId.current += 1; setReading(false); onChange(event.target.value); }} aria-invalid={invalid} aria-readonly={disabled || undefined} aria-describedby={invalid ? `${name}-error` : `${name}-hint`} />
    </>}
  </div>;
}
