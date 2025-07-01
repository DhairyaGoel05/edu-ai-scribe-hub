
import { Mail, Twitter, Linkedin, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold">EduPDF AI</span>
            </div>
            <p className="text-gray-400 mb-6">
              Transform your learning experience with our AI-powered PDF education assistant. Summaries, quizzes, and personalized assistance at your fingertips.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Github className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Mail className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tutorials</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Subscribe to our newsletter</h3>
              <p className="text-gray-400">Stay updated with the latest features and educational content.</p>
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 max-w-xs"
              />
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {currentYear} EduPDF AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
