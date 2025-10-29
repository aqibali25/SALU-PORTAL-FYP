import React, { useState } from "react";

const CnicInput = ({
  id,
  readOnly,
  value,
  onChange,
  required = true,
  width = "70%", // match InputContainer default
  className = "",
  placeholder,
}) => {
  const [cnic, setCnic] = useState("");
  const [hasBlurred, setHasBlurred] = useState(false);

  const formatCnic = (v) => {
    const clean = v.replace(/\D/g, "");
    const p1 = clean.substring(0, 5);
    const p2 = clean.substring(5, 12);
    const p3 = clean.substring(12, 13);
    let f = p1;
    if (p2) f += "-" + p2;
    if (p3) f += "-" + p3;
    return f;
  };

  const handleCnicChange = (e) => {
    const formatted = formatCnic(e.target.value);
    setCnic(formatted);
    onChange?.({ target: { id, value: formatted } });
  };

  const current = cnic || value || "";
  const invalid = hasBlurred && current && !/^\d{5}-\d{7}-\d{1}$/.test(current);

  return (
    <input
      type="text"
      id={id}
      value={current}
      onChange={handleCnicChange}
      onBlur={() => setHasBlurred(true)}
      maxLength={15}
      required={required}
      autoComplete="off"
      readOnly={readOnly}
      /* SAME width behavior as InputContainer */
      style={{ width }}
      className={`
        /* EXACT same base classes as InputContainer input */
        w-full md:w-auto
        [@media(max-width:768px)]:!w-full
        min-w-0
        !px-2 !py-1
        border-2 border-[#a5a5a5] outline-none
        bg-[#f9f9f9] text-[#2a2a2a]
        dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
        disabled:opacity-60 disabled:cursor-not-allowed
        ${invalid ? "!border-red-500" : ""}
        ${className}
      `}
      placeholder={placeholder}
    />
  );
};

export default CnicInput;
