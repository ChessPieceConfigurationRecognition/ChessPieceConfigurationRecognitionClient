import 'bootstrap/dist/css/bootstrap.css';
import React, { useState, useRef, RefObject } from 'react';
import UserForm from './UserForm.tsx';
import Chessboard from 'chessboardjsx';

interface BoardAnalyzerProps {
	name: string | undefined,
	type: string | undefined
}

const BoardAnalyzer: React.FC<BoardAnalyzerProps> = ({ name, type }) => {
	const textareaRef: RefObject<HTMLTextAreaElement> = useRef(null);
	const [fen, setFen] = useState<string>('start');
	const [orientation, setOrientation] = useState<string>('white');
	const [textareaContent, setTextareaContent] = useState<string>('');

	const updateBoard = (newFen: string, newOrientation: string) => {
		setFen(newFen);
		console.log(fen);
		console.log(newFen);
		setOrientation(newOrientation);
	}

	return (
		<div className='container'>
			<div className='row justify-content-center align-items-center'>
				<div className='col-lg-6'>
					<div className='mt-3 mb-3'>
						<UserForm name={name} type={type} updateBoard={updateBoard} setTextareaContent={setTextareaContent} />
					</div>
					<div className='mb-3'>
						<textarea ref={textareaRef} value={textareaContent} className='form-control' placeholder='Output' style={{ height: 256 + 'px', resize: 'none' }} disabled></textarea>
					</div>
					<div className='mb-3 text-center'>
						<div className='chessboard-center'>
							<Chessboard position={fen} orientation={orientation == 'white' ? 'white' : 'black'} />
						</div>
					</div>
				</div>
			</div>
		</div>
    );
}

export default BoardAnalyzer;
