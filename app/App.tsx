
"use client";

import {fabric} from 'fabric';


import LeftSidebar from "@/components/LeftSidebar";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";
import { useEffect, useRef, useState } from "react";
import { handleCanvaseMouseMove, handleCanvasMouseDown, handleCanvasMouseUp, handleCanvasObjectModified, handlePathCreated, handleResize, initializeFabric, renderCanvas } from "@/lib/canvas";
import { ActiveElement } from '@/types/type';
import { useMutation, useStorage } from '@liveblocks/react';
import { defaultNavElement } from '@/constants';
import { handleDelete } from '@/lib/key-events';


export default function Home() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fabricRef = useRef<fabric.Canvas|null> (null);
	const isDrawing = useRef(false);
	const shapeRef = useRef<fabric.Object | null> (null)
	const selectedShapeRef = useRef<string | null>('rectangle')

	const activeObjectRef = useRef<fabric.Object | null>(null)


	const canvasObjects = useStorage((root) => root.canvasObjects) || {}
	const syncShapeInStorage = useMutation(({storage}, object) =>{
		if (!object) return;

		const {objectId} =  object;

		const shapeData = object.toJSON();
		shapeData.objectId = objectId;

		const canvasObjects = storage.get('canvasObjects')

		canvasObjects.set(objectId, shapeData)

	}, [])



	const [activeElement, setActiveElement] = useState<ActiveElement>({
		name:'',
		value:'',
		icon:''
	})

	const deleteAllShapes = useMutation(({storage}) =>{
		const canvasObjects = storage.get("canvasObjects")
		if(!canvasObjects || canvasObjects.size ===0 )  return true;

		for ( const [key, value] of canvasObjects.entries()){
			canvasObjects.delete(key)
		}
		
		return canvasObjects.size ===0;

	}, [])

	const deleteShapeFromStorage = useMutation(({storage},objectId)=>{
		const canvasObjects = storage.get('canvasObjects')

		canvasObjects.delete(objectId)


	}, [])

	const handleActiveElement = (elem:ActiveElement) =>{
		setActiveElement(elem);

		switch(elem?.value){
			case 'reset':
				deleteAllShapes()
				fabricRef.current?.clear()
				setActiveElement(defaultNavElement)
				break;
			case 'delete':
				handleDelete(fabricRef.current as any, deleteShapeFromStorage)
				setActiveElement(defaultNavElement)
			default:
				break;
		}

		selectedShapeRef.current = elem?.value as string;
	}


	useEffect(()=>{
		const canvas = initializeFabric({canvasRef, fabricRef})
		
		let initialDistance = 0;
		let isPinching = false;

		// Calculate the distance between two touch points
		const getDistance = (touch1: Touch, touch2: Touch) => {
			const dx = touch2.clientX - touch1.clientX;
			const dy = touch2.clientY - touch1.clientY;
			return Math.sqrt(dx * dx + dy * dy);
		};

		const canvasElement = (canvas as any).upperCanvasEl as HTMLCanvasElement;

		

		// Handle touchstart
		canvasElement.addEventListener("touchstart", (e: TouchEvent) => {
			if (e.touches.length === 2) {
			isPinching = true;
			initialDistance = getDistance(e.touches[0], e.touches[1]);
			e.preventDefault();
			}
		});

		// Handle touchmove (zoom during pinch)
		canvasElement.addEventListener("touchmove", (e: TouchEvent) => {
			if (isPinching && e.touches.length === 2) {
			const currentDistance = getDistance(e.touches[0], e.touches[1]);
			const scale = currentDistance / initialDistance;
			let zoom = canvas.getZoom() * scale;

			// Restrict zoom levels
			if (zoom > 5) zoom = 5;
			if (zoom < 0.5) zoom = 0.5;

			// Get zoom center point from the midpoint between the two fingers
			const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
			const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
			const pointer = canvas.getPointer({ clientX: midX, clientY: midY } as any);

			canvas.zoomToPoint(pointer, zoom);
			e.preventDefault();
			}
		});

		// Handle touchend
		canvasElement.addEventListener("touchend", () => {
			isPinching = false;
		});




		// 여기서
		canvas.on("mouse:down", (options)=>{
			handleCanvasMouseDown({
				options,
				canvas,
				isDrawing,
				shapeRef,
				selectedShapeRef
			}) 
		})

		canvas.on("mouse:up", (options)=>{
			handleCanvasMouseUp	({
				canvas,
				isDrawing,
				shapeRef,
				selectedShapeRef,
				syncShapeInStorage,
				setActiveElement,
				activeObjectRef
			}) 
		})

		canvas.on("mouse:move", (options)=>{
			handleCanvaseMouseMove({
				options,
				canvas,
				isDrawing,
				shapeRef,
				selectedShapeRef,
				syncShapeInStorage
			}) 
		})
		canvas.on("object:modified", (options)=>{
			handleCanvasObjectModified({
				options,
				syncShapeInStorage
			}) 
		})

		canvas.on("path:created",(options)=>{
			handlePathCreated({options, syncShapeInStorage})
		})

		

		window.addEventListener("resize", ()=>{
			handleResize({canvas:fabricRef.current})
		})

		return () =>{
			canvas.dispose()
		}
	},[])

	
	useEffect(()=>{
		renderCanvas({
			fabricRef,
			canvasObjects,
			activeObjectRef
		})
	},[canvasObjects])

	return (
		<main className="h-screen overflow-hidden">
			<Navbar 
				activeElement={activeElement}
				handleActiveElement={handleActiveElement}
			/>
			<section className="flex h-full flex-row">
				{/* <LeftSidebar /> */}
				<Live canvasRef={canvasRef}/>
				{/* <RightSidebar/> */}

			</section>
		</main>

	);

}
