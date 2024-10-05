import { useState, ChangeEvent } from "react";

interface InputConfig {
	id: number;
	name: string;
	type: string;
	placeholder: string;
	label: string;
	required: boolean;
	pattern?: string;
	title?: string;
  }

  interface FormInputProps extends InputConfig {
	value: string;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	errorMessage?: string;
}

const FormInput= (props:FormInputProps) => {
	const [isInvalid, setIsInvalid] = useState(false);

	const [focused, setFocused] = useState(false);
	const { label, errorMessage, onChange, id, ...inputProps } = props;

	const handleFocus = (e: ChangeEvent<HTMLInputElement>) => {
		setFocused(true);
		setIsInvalid(!e.target.validity.valid);
	  };
	
	return(
		<div className="flex flex-col  mt-3">
			<label className="text-base ml-3">{label}</label>
			<input
				className={`bg-black ${isInvalid ? 'border-[#ED808C]' : ''}  w-full rounded-3xl h-14 pl-5`}
				{...inputProps}
				onChange={onChange}
				onBlur={handleFocus}
				onFocus={() =>
				inputProps.name === "confirmPassword" && setFocused(true)
				}
				data-focused={focused.toString()}
			/>
			{
				errorMessage?.length && <div className={`mt-2 mx-5 grow-0 text-[#ED808C] ${isInvalid ? '' : 'hidden'}`}>{errorMessage}</div>
			}
			
    	</div>
	)

}

export default FormInput;