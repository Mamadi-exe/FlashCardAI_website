import { div } from "framer-motion/client"


export default function HowWorks() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-12 mb-12">
            <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-800">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6 text-center py-12 px-4 bg-gray-100">
              {/* Step 1 */}
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transform hover:-translate-y-1 transition">
                <div className="text-3xl mb-2">📄</div>
                <h3 className="text-lg font-semibold">1️⃣ Paste Your Text</h3>
                <p className="text-sm text-gray-600">Add any notes or content you want to turn into flashcards.</p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transform hover:-translate-y-1 transition">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="text-lg font-semibold">2️⃣ Generate</h3>
                <p className="text-sm text-gray-600">Click the button and let our system do the rest.</p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transform hover:-translate-y-1 transition">
                <div className="text-3xl mb-2">📚</div>
                <h3 className="text-lg font-semibold">3️⃣ View Flashcards</h3>
                <p className="text-sm text-gray-600">Review the questions and answers instantly.</p>
              </div>

              {/* Step 4 */}
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transform hover:-translate-y-1 transition">
                <div className="text-3xl mb-2">💾</div>
                <h3 className="text-lg font-semibold">4️⃣ Save / Export</h3>
                <p className="text-sm text-gray-600">Keep them for later or download as a file.</p>
              </div>
            </div>
        </div>
    );
}