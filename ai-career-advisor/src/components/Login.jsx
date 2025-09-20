import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import loginAnimation from "../assets/login_animation.mp4";
import bgImage from "../assets/login_background.jpg";

export default function AuthForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) navigate("/");
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignup) {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Signup successful!");
        navigate("/");
      } catch (err) {
        alert(err.message);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
        navigate("/");
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Center Container */}
      <div className="w-full max-w-6xl h-[80vh] flex rounded-lg shadow-lg overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        
        {/* Left: Form Box */}
        <div className="w-2/5 flex items-center justify-center bg-blue-100 dark:bg-blue-900 p-8">
          <div className="w-full">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {isSignup ? "Create an account" : "Login to your account"}
            </h1>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="name@company.com"
                  className="w-full p-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="w-full p-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Confirm Password */}
              {isSignup && (
                <div>
                  <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    placeholder="••••••••"
                    className="w-full p-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={isSignup}
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isSignup ? "Create an account" : "Login"}
              </button>

              {/* Toggle Login / Signup */}
              <p className="text-sm font-light text-gray-500 dark:text-gray-400 mt-4">
                {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignup(!isSignup)}
                  className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  {isSignup ? "Login here" : "Sign up"}
                </button>
              </p>
            </form>
          </div>
        </div>

        {/* Right: Full Illustration */}
        <div className="w-3/5">
          <video
            src={loginAnimation}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </section>
  );
}
