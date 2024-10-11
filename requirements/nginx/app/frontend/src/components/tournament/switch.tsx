import { useState } from 'react'

const Switcher = () => {
  const [isChecked, setIsChecked] = useState(true)
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked)
  }

  return (
    <>
      <label className='themeSwitcherTwo relative inline-flex cursor-pointer select-none items-center'>
        <input
          type='checkbox'
          checked={isChecked}
          onChange={handleCheckboxChange}
          className='sr-only'
        />
        <span
          className={`slider mx-4 flex h-8 w-[60px] items-center rounded-full p-1 duration-200 dark:bg-[#333333] bg-[#eeeeee]`}
        >
          <span
            className={`dot h-6 w-6 rounded-full dark:bg-white bg-black duration-200 ${
              isChecked ? 'translate-x-[28px]' : ''
            }`}
          ></span>
        </span>
      </label>
    </>
  )
}

export default Switcher
