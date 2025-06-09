

import { VideoIcon } from 'lucide-react'
import React from 'react'

const CallButton = ({handleVideoCall}) => {
  return (
    <div className='p-3 border-b flex items-cent w-full absolute top-0er justify-end max-w-7xl mx-auto'>
        <button onClick={handleVideoCall} className='btn btn-success btn-sm text-white'>
            <VideoIcon className='size-6'/>
        </button>
    </div>
  )
}

export default CallButton