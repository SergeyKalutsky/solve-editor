import { JSX } from "react"

interface Props {
    handleToggle: (e:React.MouseEvent) => void
    horisontal: boolean
}

const ToggleBar = ({ handleToggle, horisontal }: Props): JSX.Element => {
    const className = horisontal ? 
    'hover:h-[4px] h-[2px] hover:bg-blue-700 bg-neutral-500 hover:cursor-row-resize w-full drop-shadow-lg' : 
    'hover:w-1 w-full hover:bg-blue-700 bg-neutral-500 hover:cursor-col-resize w-[2px] drop-shadow-lg'
    return (
        <button className={className} onMouseDown={handleToggle} />
    )
}

export default ToggleBar
