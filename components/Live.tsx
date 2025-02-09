import React, { RefObject, useCallback, useRef } from 'react'
import LiveCursors from './cursor/LiveCursors'
import { useMyPresence, useOthers } from '@liveblocks/react/suspense'


type Props ={
    canvasRef: RefObject<HTMLCanvasElement | null>

}


const Live = ({canvasRef}:Props) => {
    const others = useOthers();

    const [{cursor}, updateMyPresence] = useMyPresence() as any;

    const handlePointerMove = useCallback((event: React.PointerEvent)=>{
        event.preventDefault();
        const x = event.clientX- event.currentTarget.getBoundingClientRect().x
        const y = event.clientY- event.currentTarget.getBoundingClientRect().y
        updateMyPresence({cursor: {x, y}})

    }, [])


    const handlePointerLeave = useCallback((event: React.PointerEvent)=>{
        event.preventDefault();   
        updateMyPresence({cursor: null, message: null})
    }, [])

    const handlePointerDown = useCallback((event: React.PointerEvent)=>{
        const x = event.clientX- event.currentTarget.getBoundingClientRect().x
        const y = event.clientY- event.currentTarget.getBoundingClientRect().y
        updateMyPresence({cursor: {x, y}})
    }, [])

    return (
        <div 
            id="canvas"
            onPointerMove ={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            className="h-[100vh] w-full flex justify-center items-center text-center"
        >
            <canvas ref={canvasRef}  />
            <LiveCursors others={others} />
        </div>
    )
}

export default Live
