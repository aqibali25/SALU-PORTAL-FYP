import { forwardRef } from "react";

const InputContainer = forwardRef(
  (
    {
      htmlFor,
      required,
      inputType = "text",
      title,
      readOnly,
      value,
      onChange,
      placeholder = "",
      disabled,
      width = "70%",
      autoComplete,
      spellCheck = false,
    },
    ref
  ) => {
    const computedAC =
      autoComplete ?? (inputType === "password" ? "new-password" : "off"); // default behavior

    return (
      <div
        className="
        flex w-full max-w-[800px]
        items-start md:items-center justify-start
        flex-col md:flex-row
        gap-[8px] md:gap-5
        [@media(max-width:550px)]:gap-[5px]
      "
      >
        <label
          htmlFor={htmlFor}
          className="
            w-auto md:w-1/4
            text-start md:text-right
            text-gray-900 dark:text-white
          "
        >
          {required && <span className="text-[#ff0000] mr-1">*</span>}
          {title}:
        </label>

        <input
          style={{ width }}
          ref={ref}
          value={value}
          type={inputType}
          id={htmlFor}
          required={required}
          readOnly={readOnly}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={computedAC}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={spellCheck}
          data-1p-ignore // hint for 1Password
          data-lpignore="true" // hint for LastPass
          className="
            w-full md:w-auto
            [@media(max-width:768px)]:!w-full
            min-w-0
            !px-2 !py-1
            border-2 border-[#a5a5a5] outline-none
            bg-[#f9f9f9] text-[#2a2a2a]
            dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        />
      </div>
    );
  }
);

export default InputContainer;
