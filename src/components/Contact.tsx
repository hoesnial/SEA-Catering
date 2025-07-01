import React, { useState } from 'react';
import { Phone, User, MapPin, Clock, Mail, MessageCircle, Send, ChefHat, Utensils, Heart } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmitSuccess(true);
    setIsSubmitting(false);
    
    // Reset form after success
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
      });
      setSubmitSuccess(false);
    }, 3000);
  };

  const handleWhatsApp = () => {
    const phoneNumber = '08123456789';
    const message = 'Hello! I would like to know more about SEA Catering meal plans.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCall = () => {
    window.location.href = 'tel:08123456789';
  };

  if (submitSuccess) {
    return (
      <section id="contact" className="py-20 bg-gradient-to-br from-emerald-900 via-emerald-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="text-green-300" size={40} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Terima Kasih!</h3>
            <p className="text-emerald-100 text-lg mb-6">
              Pesan Anda telah berhasil dikirim. Tim SEA Catering akan menghubungi Anda dalam 24 jam.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
              >
                <MessageCircle size={20} className="mr-2" />
                Chat WhatsApp
              </button>
              <button 
                onClick={handleCall}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
              >
                <Phone size={20} className="mr-2" />
                Telepon Sekarang
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-emerald-900 via-emerald-800 to-blue-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10">
          <Utensils size={60} className="text-white/20" />
        </div>
        <div className="absolute top-32 right-20">
          <ChefHat size={80} className="text-white/20" />
        </div>
        <div className="absolute bottom-20 left-32">
          <Heart size={50} className="text-white/20" />
        </div>
        <div className="absolute bottom-40 right-10">
          <Utensils size={70} className="text-white/20" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mr-4">
              <ChefHat className="text-emerald-300" size={32} />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Hubungi <span className="text-emerald-300">Kami</span>
            </h2>
          </div>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
            Punya pertanyaan tentang paket makanan sehat kami? Ingin memesan atau konsultasi menu? 
            Tim SEA Catering siap membantu Anda setiap saat.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mr-4">
                  <Utensils className="text-emerald-300" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-emerald-300">Informasi Kontak</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4 group">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                    <User className="text-emerald-300" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Manager</div>
                    <div className="text-emerald-200 text-lg">Brian</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 group">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <Phone className="text-blue-300" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Nomor Telepon</div>
                    <div className="text-blue-200 text-lg">08123456789</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 group">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                    <MapPin className="text-orange-300" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Area Layanan</div>
                    <div className="text-orange-200 text-lg">Kota Besar di Seluruh Indonesia</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 group">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <Clock className="text-purple-300" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Jam Operasional</div>
                    <div className="text-purple-200 text-lg">Senin - Minggu, 06:00 - 22:00</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 group">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center group-hover:bg-pink-500/30 transition-colors">
                    <Mail className="text-pink-300" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Email</div>
                    <div className="text-pink-200 text-lg">hello@seacatering.id</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4 text-emerald-300 flex items-center">
                <MessageCircle className="mr-2" size={24} />
                Kontak Cepat
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={handleWhatsApp}
                  className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105"
                >
                  <MessageCircle size={20} />
                  <span>WhatsApp</span>
                </button>
                <button 
                  onClick={handleCall}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105"
                >
                  <Phone size={20} />
                  <span>Telepon</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mr-4">
                <Send className="text-emerald-300" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-emerald-300">Kirim Pesan</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nama Lengkap</label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  placeholder="Masukkan nama lengkap Anda"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  placeholder="email@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nomor Telepon</label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  placeholder="08123456789"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Subjek</label>
                <select 
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="General Inquiry" className="bg-gray-800">Pertanyaan Umum</option>
                  <option value="Meal Plan Question" className="bg-gray-800">Pertanyaan Paket Makanan</option>
                  <option value="Order Placement" className="bg-gray-800">Pemesanan</option>
                  <option value="Delivery Information" className="bg-gray-800">Informasi Pengiriman</option>
                  <option value="Feedback" className="bg-gray-800">Saran & Masukan</option>
                  <option value="Partnership" className="bg-gray-800">Kerjasama</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Pesan</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all duration-300"
                  placeholder="Ceritakan bagaimana kami bisa membantu Anda..."
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Mengirim Pesan...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Kirim Pesan</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <ChefHat className="text-emerald-300 mr-3" size={32} />
              <h3 className="text-2xl font-bold text-emerald-300">Bergabunglah dengan Komunitas Sehat Kami</h3>
            </div>
            <p className="text-emerald-100 mb-6 text-lg">
              Ikuti media sosial kami untuk inspirasi makanan sehat harian, tips nutrisi, dan penawaran eksklusif untuk pelanggan setia SEA Catering.
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => window.open('https://facebook.com', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Facebook
              </button>
              <button 
                onClick={() => window.open('https://instagram.com', '_blank')}
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Instagram
              </button>
              <button 
                onClick={handleWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;