import MorseTrainerWrapper from '@/components/MorseTrainerWrapper'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Morse Code Trainer | Learn Morse with Koch Method & Contest Runner</title>
        <meta 
          name="description" 
          content="An interactive Morse code training application with Koch method and contest simulation for ham radio operators."
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <MorseTrainerWrapper />
      </div>
    </>
  );
}
