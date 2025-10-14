import atrocityVictimSupport from '../../assets/victim.png';
import unityAndFuture from '../../assets/marriage.png';
import { Link } from 'react-router-dom';
import {Gavel, Users} from 'lucide-react';

const DashboardPage = () => {
  return (
    <>
      <div className=" w-full bg-white flex flex-col items-center justify-center overflow-x-hidden">
        <div className='flex max-w-5xl flex-col items-center justify-center w-full pb-20'>
        {/* Hero Section */}
        <div className="w-full text-center py-8 px-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-indigo-900 drop-shadow-lg mb-3">Government Schemes</h1>
          <p className="text-lg text-slate-700 mb-2">Explore and apply for welfare schemes provided by the Ministry of Social Justice & Empowerment.</p>
          <p className="text-base text-slate-500">Currently available: <span className="font-semibold text-indigo-700">Inter-caste Marriage Incentive</span> & <span className="font-semibold text-blue-700">Relief for Atrocity Victim (FIR)</span></p>
        </div>

        {/* Schemes Grid */}
        <div className="w-full px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-900">Available Schemes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Atrocity Victim Support Card */}
            <div className="bg-white/90 backdrop-blur-lg shadow-2xl flex flex-col transform hover:-translate-y-2 hover:shadow-indigo-200 transition-all duration-300 rounded-2xl overflow-hidden border border-slate-100">
              <div className="relative w-full h-48 bg-cover bg-center" style={{ backgroundImage: `url(${atrocityVictimSupport})` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-600 opacity-50"></div>
                <div className="relative h-full flex items-center justify-center">
                  <h3 className="text-white text-3xl font-bold drop-shadow">Support and Dignity</h3>
                </div>
              </div>
              <div className="px-7 py-4 flex flex-col flex-grow">
                <div className="flex items-center mb-2">
                  <div className="p-3 rounded-full mr-3 bg-blue-100 text-blue-700"><Gavel width="24" height="24" /></div>
                  <h3 className="text-xl font-bold text-blue-700">Relief for Atrocity Victim (FIR)</h3>
                </div>
                <p className="text-slate-700 flex-grow ml-12 pb-4 text-left">Apply for monetary relief and support under the Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act. This scheme provides financial assistance and rehabilitation to victims of caste-based atrocities.</p>
                <Link to={'/atrocity-relief'}>
                  <button className="w-full text-white font-bold py-3 px-4 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg">
                    Start Application
                  </button>
                </Link>
              </div>
            </div>

            {/* Inter-caste Marriage Incentive Card */}
            <div className="bg-white/90 backdrop-blur-lg shadow-2xl flex flex-col transform hover:-translate-y-2 hover:shadow-yellow-200 transition-all duration-300 rounded-2xl overflow-hidden border border-slate-100">
              <div className="relative w-full h-52 bg-cover bg-center" style={{ backgroundImage: `url(${unityAndFuture})` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-200 opacity-60"></div>
                <div className="relative h-full flex items-center justify-center">
                  <h3 className="text-white text-3xl font-bold drop-shadow">Unity and Future</h3>
                </div>
              </div>
              <div className="px-7 py-4 flex flex-col flex-grow">
                <div className="flex items-center mb-3">
                  <div className="p-3 rounded-full mr-3 bg-yellow-100 text-yellow-700"><Users width="24" height="24" /></div>
                  <h3 className="text-xl font-bold text-yellow-700">Inter-caste Marriage Incentive</h3>
                </div>
                <p className="text-slate-700 flex-grow ml-12 pb-4 text-left">Apply for the incentive scheme designed to promote social integration and harmony through inter-caste marriages. Eligible couples receive financial support to encourage social equality.</p>
                <Link to="/inter-caste-marriage">
                  <button className="w-full mt-auto text-white font-bold py-3 px-4 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-400 hover:from-orange-400 hover:to-yellow-500 transition-all duration-300 shadow-lg">
                    Start Application
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
 );
}

export default DashboardPage;