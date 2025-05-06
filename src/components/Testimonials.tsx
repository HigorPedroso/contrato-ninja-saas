
const testimonials = [
  {
    name: "Ana Silva",
    role: "Designer Freelancer",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    quote:
      "O ContratoFlash me livrou de dores de cabeça com clientes. Agora tenho documentos profissionais que protegem meu trabalho.",
    stars: 5,
  },
  {
    name: "Carlos Mendes",
    role: "Desenvolvedor Web",
    image: "https://randomuser.me/api/portraits/men/35.jpg",
    quote:
      "Incrível como economizei tempo e dinheiro. Antes, gastava horas tentando criar contratos ou pagava caro para advogados.",
    stars: 5,
  },
  {
    name: "Juliana Costa",
    role: "Consultora de Marketing",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    quote:
      "A ferramenta é extremamente intuitiva e os contratos são claros mesmo para clientes sem conhecimento jurídico.",
    stars: 4,
  },
];

const Testimonials = () => {
  return (
    <section className="section bg-white">
      <div className="container-tight">
        <div className="text-center mb-14">
          <h2 className="mb-4">O que dizem nossos clientes</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Centenas de freelancers e pequenos empresários já usam o ContratoFlash para proteger seus negócios.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col card-hover"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-medium">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${
                      i < testimonial.stars
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-700 italic flex-grow">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
