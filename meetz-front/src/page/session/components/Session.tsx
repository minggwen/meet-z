import React from 'react';
import { useState, useEffect } from 'react';
import { Publisher, Subscriber } from 'openvidu-browser';
import Video from './Video';
import { useSessionStore } from '../../../zustand/useSessionStore';
import html2canvas from 'html2canvas';
import camera_icon from '/src/assets/images/camera.png';
import NoBlackList from '../../meeting/components/CreateAndModify/NoBlackList';

interface SessionProps {
	subscriber: Subscriber;
	publisher: Publisher;
}


function Session({ subscriber, publisher }: SessionProps) {
	const [count,setCount] = useState(0);
	const {starName, setStartName} = useSessionStore();
	const [fanName, setFanName] = useState("");
	const [role,setRole] = useState("");
	const [memo,setMemo] = useState("");
	const [takePhoto,setTakePhoto] = useState(false);
	const toggleTakePhoto=()=>{setTakePhoto(true);}
	const handleCompleteTakePhoto=()=>{setTakePhoto(false);}
	
	useEffect(()=>{
		// localStorage에서 가져올 데이터 값들
		setRole("fan");
		setFanName("밍경잉");
		setStartName("라이언");
		setMemo("이어닝 너무 귀여워ㅠㅠ");

	},[]);
	useEffect(()=>{
		if(!takePhoto)return;
		
	},[takePhoto]);

	//3초 타이머 설정
	useEffect(() =>{
		if(!takePhoto)return;
		setCount(3);
		console.log("시작!");
		const timerId = setInterval(() => {
			setCount(prevCount => {
			  if (prevCount <= 1) {
				clearInterval(timerId);
				capturePhoto();
				return 0;
			  }
			  return prevCount - 1;
			});
		  }, 1000);;

		return () => clearInterval(timerId);
	},[takePhoto])

	const capturePhoto = async () => {
		console.log("찰칵!");
		const element1 = document.getElementById('meetingVideo-star');
		const element2 = document.getElementById('meetingVideo-fan');
		if(element1&&element2){
			const canvas1 = await html2canvas(element1);
            const blob1 = await new Promise<Blob | null>(resolve => canvas1.toBlob(resolve, 'image/jpeg'));

            const canvas2 = await html2canvas(element2);
            const blob2 = await new Promise<Blob | null>(resolve => canvas2.toBlob(resolve, 'image/jpeg'));
			if(blob1&&blob2){
				const img1 = new Image();
				img1.src = URL.createObjectURL(blob1);

				const img2 = new Image();
				img2.src = URL.createObjectURL(blob2);

				img1.onload = () =>{
					img2.onload=()=>{
						const mirroredCanvas1 = document.createElement('canvas');
                        const mirroredCanvas2 = document.createElement('canvas');

                        mirroredCanvas1.width = img1.width;
                        mirroredCanvas1.height = img1.height;
                        mirroredCanvas2.width = img2.width;
                        mirroredCanvas2.height = img2.height;

                        const ctx1 = mirroredCanvas1.getContext('2d');
                        const ctx2 = mirroredCanvas2.getContext('2d');

                        if (ctx1) {
                            ctx1.translate(mirroredCanvas1.width, 0);
                            ctx1.scale(-1, 1);
                            ctx1.drawImage(img1, 0, 0);
                        }

                        if (ctx2) {
                            ctx2.translate(mirroredCanvas2.width, 0);
                            ctx2.scale(-1, 1);
                            ctx2.drawImage(img2, 0, 0);
                        }

						//이미지 돌리고 합치기
						const finalCanvas = document.createElement('canvas');
                        finalCanvas.width = mirroredCanvas1.width + mirroredCanvas2.width;
                        finalCanvas.height = Math.max(mirroredCanvas1.height, mirroredCanvas2.height);

                        const finalCtx = finalCanvas.getContext('2d');
                        if (finalCtx) {
                            finalCtx.drawImage(mirroredCanvas1, 0, 0);
                            finalCtx.drawImage(mirroredCanvas2, mirroredCanvas1.width, 0);
                        }

                        // Download the final image
                        finalCanvas.toBlob(blob => {
                            if (blob) {
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = 'screenshot.jpg';
                                link.click();
                                URL.revokeObjectURL(url);
                            }
                        }, 'image/jpeg');
					}
				}
			}
			handleCompleteTakePhoto();
		}
	  };
	const renderSubscribers = () => {
		if(role=='star'){
			return (
				<div className='flex'>
					
					<div className='relative w-1/2'   id='meetingVideo-star'>
						<Video streamManager={publisher} />
						{	!takePhoto&&
							<p className='absolute top-0 left-0 p-1 text-white bg-black bg-opacity-75 rounded'>
								{starName}
							</p>
						}
					</div>
					<div className='relative w-1/2'  id='meetingVideo-fan'>
						<Video streamManager={subscriber} />
						{	subscriber&&!takePhoto&&
							<p className='absolute top-0 right-0 p-1 text-white bg-black bg-opacity-75 rounded'>
								{fanName}
							</p>
						}
						
					</div>
				</div>
			);
		}else{
			return (
				<div>
					<div className='flex'>
						<div className='relative w-1/2'  id='meetingVideo-fan'>
							<Video streamManager={subscriber} />
							{	subscriber&&!takePhoto&&
								<p className='absolute top-0 left-0 p-1 text-white bg-black bg-opacity-75 rounded'>
									{starName}
								</p>
							}
							
						</div>
						<div className='relative w-1/2'   id='meetingVideo-star'>
							<Video streamManager={publisher} />
							{	!takePhoto&&
								<p className='absolute top-0 right-0 p-1 text-white bg-black bg-opacity-75 rounded'>
									{fanName}
								</p>
							}
						</div>
					</div>
					
					<div className='flex flex-col justify-center items-center m-4'>
						<div className="w-[846px] h-[80px] bg-[#FE9374] mt-2 p-4">
							<p>{memo}</p>
						</div>
						<img className='w[48px] h-[48px]' src={camera_icon} onClick={toggleTakePhoto}/>
					</div>
				</div>
			);
		}
		
		
	};
	//3초 카운트 보여주는 html
	return(
		<>
			{renderSubscribers()}
			{count !== null && count > 0 && (
				<div className="fixed inset-0 flex justify-center items-center">
					<div className="text-6xl text-white font-bold">
						{count}
					</div>

				</div>
			)}

		</>
	)

	return <>{renderSubscribers()}</>;
}
export default Session;