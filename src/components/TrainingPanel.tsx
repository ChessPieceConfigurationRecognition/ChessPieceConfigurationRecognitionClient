import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ModelList from './ModelList';

const socket = io(import.meta.env.VITE_SERVER_URL);

interface TrainingProps {
    onTrainingComplete: () => void;
    modelList: { name: string, type: string }[];
}

interface Vgg16TrainingOutput {
    epoch: string;
    accuracy: string;
    loss: string;
}

interface YoloTrainingOutput {
    epoch: string;
    gpu_mem: string;
    box_loss: string;
    cls_loss: string;
    dfl_loss: string;
    instances: string;
    progress: string;
    speed: string;
}

const TrainingPanel: React.FC<TrainingProps> = ({ onTrainingComplete, modelList }) => {
    const [trainingStatus, setTrainingStatus] = useState<string>('unknown');
    const [files, setFiles] = useState<FileList | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [trainingOutput, setTrainingOutput] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);
    const outputRef = useRef<HTMLTextAreaElement>(null);
    const [name, setName] = useState<string>('');
    const [taskType, setTaskType] = useState<string>('object_detection');

    useEffect(() => {
        const fetchInitialStatus = async () => {
            try {
                const serverUrl = import.meta.env.VITE_SERVER_URL;
                const response = await fetch(`${serverUrl}/status`);
                if (response.ok) {
                    const data = await response.json();
                    if(data.training_running) {
                        setTrainingOutput('Training is running...' + '\n');
                        setTrainingStatus('training');
                    }
                    else {
                        setTrainingStatus('idle');
                    }
                } else {
                    console.error('Failed to fetch initial status');
                }
            } catch (error) {
                console.error('Error fetching initial status:', error);
            }
        };

        fetchInitialStatus();

        socket.on('training_update', (data: { output?: YoloTrainingOutput | Vgg16TrainingOutput | string, done?: boolean, type?: string}) => {
            if (typeof data.output === 'string') {
                setTrainingOutput(prevOutput => prevOutput + data.output + '\n');
            } else if (data.output) {
                if (data.type === 'vgg16') {
                    const output = data.output as Vgg16TrainingOutput;
                    const formattedOutput = `${output.epoch}, accuracy: ${parseFloat(output.accuracy).toFixed(4)}, loss: ${parseFloat(output.loss).toFixed(4)}`;
                    setTrainingOutput(prevOutput => prevOutput + formattedOutput + '\n');
                } else if (data.type === 'yolo') {
                    const yoloOutput = data.output as YoloTrainingOutput;
                    const formattedOutput = `Epoch ${yoloOutput.epoch}, box Loss: ${yoloOutput.box_loss}, class loss: ${yoloOutput.cls_loss}, DFL loss: ${yoloOutput.dfl_loss}, instances: ${yoloOutput.instances}, progress: ${yoloOutput.progress}%`;
                    setTrainingOutput(prevOutput => prevOutput + formattedOutput + '\n');
                }
            }
            if (data.done) {
                onTrainingComplete();
            }
        });
        

        return () => {
            socket.off('training_update');
        };
    }, [onTrainingComplete]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(event.target.files);
        }
    };

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [trainingOutput]);

    const startTraining = async (): Promise<void> => {
        if (!files) {
            alert('Please upload a folder before starting the training.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('type', taskType);
        Array.from(files).forEach(file => {
            formData.append('files', file, file.webkitRelativePath);
        });

        setIsUploading(true);

        try {
            setTrainingOutput('Starting training...' + '\n');
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const response = await fetch(`${serverUrl}/train`, {
                method: 'POST',
                body: formData
            });

            setIsUploading(false);

            if (response.ok) {
                setTrainingStatus('training');
            } else {
                const errorMessage = await response.text();
                alert(`Failed to start training: ${errorMessage}`);
                setTrainingOutput('');
            }
        } catch (error) {
            console.error('Error starting training:', error);
            alert('Failed to start training: Network error');
            setIsUploading(false);
        }
    };
    const stopTraining = async (): Promise<void> => {
        setTrainingOutput(prevOutput => prevOutput + 'Stopped training.' + '\n');
        const serverUrl = import.meta.env.VITE_SERVER_URL;
        const response = await fetch(`${serverUrl}/stop`, {
            method: 'POST',
        });
        if (response.ok) {
            setTrainingStatus('idle');
        } else {
            alert('Failed to stop training');
        }
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.setAttribute('webkitdirectory', 'true');
        }
    }, []);

    return (
        <div className='card container justify-content-center align-items-center mt-5 mb-5'>
            <div className='col-9'>
                <div className='mt-5'>
                    <h3>Train model</h3>
                </div>
                
                <div className='mt-4'>
                    {taskType === 'object_detection' && (
                        <div className='alert alert-secondary' role='alert'>
                            Ensure that the dataset folder follows the YOLO format. Make sure it is annotated with the following classes: 'white-pawn', 'black-pawn', ... (color-type, 12 classes in total).
                        </div>
                    )}
                    {taskType === 'image_classification' && (
                        <div className='alert alert-secondary' role='alert'>
                            Ensure that the folder contains images with filenames starting with: 'empty', 'pawn_white_white_1', 'pawn_black_black_55', ... ('empty', 'type_piececolor_squarecolor_number', 25 formats in total). Example: 'empty_1.jpg', 'empty_2.jpg', 'queen_white_black_100.jpg'. The property 'squarecolor' does not have to be accurate.
                        </div>
                    )}
                    <select className='form-select mt-3' value={taskType} onChange={(e) => setTaskType(e.target.value)}>
                        <option value='object_detection'>YOLO Object Detection</option>
                        <option value='image_classification'>VGG16 Image Classification</option>
                    </select>
                </div>
                <div className='mt-4'>
                    <label className='form-label' htmlFor='modelName'>Model Name:</label>
                    <input
                        className='form-control'
                        type='text'
                        id='modelName'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder='Enter model name'
                    />
                </div>
                <div className='mt-4'>
                    <label htmlFor='fileInput' className='form-label'>Upload dataset:</label>
                    <input
                        className='form-control'
                        ref={inputRef}
                        type='file'
                        multiple
                        onChange={handleFileChange}
                    />
                </div>
                <div>
                    <button className='btn btn-dark' onClick={startTraining} disabled={trainingStatus === 'training' || trainingStatus === 'unknown' || isUploading}>
                        {isUploading ? 'Uploading...' : 'Start Training'}
                    </button>
                    <button className='m-4 btn btn-dark' onClick={stopTraining} disabled={trainingStatus !== 'training'}>
                        Stop Training
                    </button>
                </div>
                <div>
                    <p>Training logs:</p>
                </div>
                <div className='mt-4'>
                    <textarea
                        className='w-100'
                        ref={outputRef}
                        rows={10}
                        cols={50}
                        value={trainingOutput}
                        readOnly
                        style={{ resize: 'none' }}
                    />
                </div>
                <ModelList modelList={modelList} />
            </div>
        </div>
    );
};

export default TrainingPanel;