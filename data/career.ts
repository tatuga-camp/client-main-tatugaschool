export type CareerExample = {
  title: string;
  titleTh?: string;
  description: string;
  descriptionTh?: string;
  salary?: string;
};

// `title` stays English: it is the key that matches career titles from the API.
export type CareerSector = {
  title: string;
  titleTh?: string;
  picture: string;
  // The catalog uses both spellings; read through localizeSector().
  blurhash?: string;
  blurHash?: string;
  description: string;
  descriptionTh?: string;
  careers: CareerExample[];
};

export const careerSectors: CareerSector[] = [
  {
    title: "Agriculture and natural resources careers",
    titleTh: "อาชีพด้านเกษตรกรรมและทรัพยากรธรรมชาติ",
    descriptionTh:
      "อาชีพด้านเกษตรกรรมและทรัพยากรธรรมชาติเกี่ยวข้องกับสิ่งแวดล้อมเป็นหลัก ผู้ที่ทำงานในสายอาชีพนี้ช่วยให้มนุษย์ใช้ทรัพยากรของโลกอย่างยั่งยืน ด้านล่างคือตัวอย่างอาชีพด้านเกษตรกรรมและทรัพยากรธรรมชาติ",
    picture:
      "https://storage.googleapis.com/public-tatugaschool/careers/Agriculture.png",
    blurhash: "LRJaPx$gNG$|.mI=WDbGGvV]afWX",
    description:
      "Careers in agriculture and natural resources are centred around the environment. Occupations within this career ensure humans are using the planet's resources sustainably. Below are some examples of jobs in agriculture and natural resources.",
    careers: [
      {
        title: "Geologist",
        titleTh: "นักธรณีวิทยา",
        descriptionTh:
          "นักธรณีวิทยาศึกษากระบวนการต่าง ๆ ของโลก เช่น แผ่นดินไหว ดินถล่ม และน้ำท่วม นักธรณีวิทยาสำรวจแร่ โลหะ ก๊าซธรรมชาติ น้ำ และน้ำมัน และมักใช้โปรแกรมคอมพิวเตอร์ในการทำแผนที่และวิเคราะห์ข้อมูล",
        description:
          "Geologists study the earth's processes such as earthquakes, landslides and floods. Geologists investigate minerals, metals, natural gas, water and oil. They often use computer applications to map areas and analyse data.",
        salary: "$129,503",
      },
      {
        title: "Crop manager",
        titleTh: "ผู้จัดการฟาร์มพืชผล",
        descriptionTh:
          "ผู้จัดการฟาร์มพืชผลดูแลกระบวนการปลูกพืชทั้งหมด ตั้งแต่การเพาะปลูก การใส่ปุ๋ย ไปจนถึงการเก็บเกี่ยว และอาจต้องดูแลพนักงาน เช่น คนเก็บผลไม้ ซึ่งเป็นอีกอาชีพหนึ่งที่เป็นที่นิยมมากในอุตสาหกรรมเกษตรปัจจุบัน",
        description:
          "Crop managers are in charge of the entire process of growing crops. This can include planting, fertilising and harvesting. They may also be in charge of employees such as fruit pickers, another very popular job in the current agriculture industry.",
        salary: "$88,699",
      },
    ],
  },
  {
    title: "Architecture and Construction",
    titleTh: "สถาปัตยกรรมและการก่อสร้าง",
    descriptionTh:
      "หากคุณสนใจอาคารสมัยใหม่และกระบวนการสร้างสรรค์อาคาร สถาปัตยกรรมและการก่อสร้างอาจเป็นอาชีพที่เหมาะกับคุณ อุตสาหกรรมนี้มีงานที่ต้องลงมือปฏิบัติจริงและใช้การคิดเชิงตรรกะหลายประเภท ด้านล่างคือตัวอย่างอาชีพในกลุ่มนี้",
    picture:
      "https://storage.googleapis.com/public-tatugaschool/careers/Architecture.png",
    blurHash: "LLNK0Bt8~XNG%1oft6sm_4ad%Moz",
    description:
      "If you are interested in modern buildings and their creative process, architecture and construction could be the career for you. This industry has a cluster of hands-on jobs that require logical thinking. Here are a couple of occupations within this career type.",
    careers: [
      {
        title: "Electrician",
        titleTh: "ช่างไฟฟ้า",
        descriptionTh:
          "ช่างไฟฟ้ามีหน้าที่ติดตั้งระบบไฟฟ้าในอาคารหลายประเภท งานหลักคือการเดินสายไฟและติดตั้งระบบแสงสว่าง รวมถึงซ่อมแซมเมื่อจำเป็น",
        description:
          "Electricians are in charge of installing power systems within many types of buildings. Their primary duties are installing wiring and lighting systems and fixing them when necessary.",
        salary: "$91,870",
      },
      {
        title: "Construction manager",
        titleTh: "ผู้จัดการงานก่อสร้าง",
        descriptionTh:
          "หน้าที่หลักของผู้จัดการงานก่อสร้างคือวางแผน จัดทำงบประมาณ ประสานงาน และควบคุมโครงการก่อสร้าง เพื่อให้โครงการเสร็จตรงเวลา โดยติดตามงานตั้งแต่ต้นจนจบ",
        description:
          "A construction manager's primary duty is to plan, budget, coordinate and oversee construction projects. They are there to ensure the project is finished on time and follow it from start to finish.",
        salary: "$157,736",
      },
    ],
  },
  {
    title: "Business management, finance, and administration careers",
    titleTh: "อาชีพด้านการบริหารธุรกิจ การเงิน และงานธุรการ",
    descriptionTh:
      "หากคุณถนัดด้านการบริหารหรือตัวเลข คุณอาจพิจารณาอาชีพด้านการบริหารธุรกิจหรืองานธุรการ ด้านล่างคือตัวอย่างอาชีพ",
    picture:
      "https://storage.googleapis.com/public-tatugaschool/careers/Business.png",
    blurhash: "LMKdxco}Iqs:_Nt7%goe.8e.Nxo0",
    description:
      "If you have a flair for management or numbers, you may consider a career in business management or administration. Below are some examples.",
    careers: [
      {
        title: "Accountant",
        titleTh: "นักบัญชี",
        descriptionTh:
          "นักบัญชีดูแลการจัดเก็บและตรวจสอบข้อมูลทางการเงิน มีหน้าที่หลากหลายทั้งให้กับธุรกิจและลูกค้ารายบุคคล เช่น วิเคราะห์ข้อมูล จัดทำรายงานการเงิน ดูแลเอกสาร และพูดคุยกับลูกค้า",
        description:
          "An accountant handles the keeping and assessing of financial records. They have a wide range of tasks, either for businesses or individual clients. These can include analysing data, financial reports, maintaining files and talking to clients.",
        salary: "$76,888",
      },
      {
        title: "Human Resources manager",
        titleTh: "ผู้จัดการฝ่ายทรัพยากรบุคคล",
        descriptionTh:
          "ผู้จัดการฝ่ายทรัพยากรบุคคลดูแลงานด้านการบริหารบุคคลขององค์กร อาจรับสมัครและสัมภาษณ์พนักงานใหม่ รวมถึงสัมภาษณ์พนักงานที่ลาออก และยังรับผิดชอบเรื่องค่าตอบแทน การลา และสวัสดิการ",
        description:
          "Human resource managers oversee the administration side of a business. They may hire and interview new staff, as well as conduct exit interviews. HR managers are also responsible for administering pay, leave and benefits.",
        salary: "$114,402",
      },
    ],
  },
  {
    title: "Education careers",
    titleTh: "อาชีพด้านการศึกษา",
    descriptionTh:
      "เมื่อพูดถึงอาชีพที่ให้คุณค่าทางใจ การศึกษาเป็นหนึ่งในอันดับต้น ๆ อุตสาหกรรมการศึกษาช่วยให้คนรุ่นใหม่พัฒนาทักษะทั้งด้านส่วนตัวและด้านอาชีพ ด้านล่างคือตัวอย่างอาชีพในวงการการศึกษา",
    picture:
      "https://storage.googleapis.com/public-tatugaschool/careers/Education.png",
    blurhash: "LKJacR#Q%2RR_MR,?Hoz_2S%SwjY",
    description:
      "When considering rewarding careers, education is near the top of the list. The education industry helps the younger generations to develop personal and professional skills. Below are a few jobs within the education industry.",
    careers: [
      {
        title: "High school teacher",
        titleTh: "ครูมัธยมศึกษา",
        descriptionTh:
          "ครูมัธยมศึกษามีหน้าที่เตรียมนักเรียนให้พร้อมสำหรับชีวิตหลังสำเร็จการศึกษา งานหลักคือการวางแผนการสอนและช่วยเหลือนักเรียนที่มีปัญหา โดยดูแลทั้งนักเรียนรายบุคคลและทั้งชั้นเรียน",
        description:
          "High school teachers are responsible for preparing students for life after graduation. Their primary duties include planning lessons, guiding students who are having trouble. They focus on individuals and entire classrooms.",
        salary: "$97,074",
      },
      {
        title: "Training and development specialist",
        titleTh: "ผู้เชี่ยวชาญด้านการฝึกอบรมและพัฒนาบุคลากร",
        descriptionTh:
          "ผู้เชี่ยวชาญด้านการฝึกอบรมและพัฒนาบุคลากรออกแบบและสร้างหลักสูตรอบรม แล้วนำไปจัดให้พนักงานเพื่อเพิ่มพูนความรู้และทักษะ โดยใช้เทคนิคหลากหลาย เช่น กิจกรรมสร้างความสัมพันธ์ในทีม และระบุความต้องการด้านการอบรมจากการประเมินจุดแข็งและจุดอ่อน",
        description:
          "Training and development specialists design and create training sessions and programs. They deliver these to employees to improve their knowledge and skills. They use a variety of different techniques such as team bonding exercises. Training specialists identify training needs by assessing strengths and weaknesses.",
        salary: "$95,967",
      },
    ],
  },
  {
    title: "Arts, marketing and communication careers",
    titleTh: "อาชีพด้านศิลปะ การตลาด และการสื่อสาร",
    descriptionTh:
      "อาชีพด้านศิลปะ การตลาด และการสื่อสารเหมาะกับผู้ที่ชอบแสดงออกและมีความคิดสร้างสรรค์ หากคุณชอบคิดค้นสิ่งใหม่และมีความเป็นตัวของตัวเอง คุณอาจพิจารณาอาชีพในสายนี้ ด้านล่างคือตัวอย่างอาชีพ",
    picture:
      "https://storage.googleapis.com/public-tatugaschool/careers/Arts.png",
    blurhash: "LSN,PXOF.SxC%Mn$afof?wt7RPR-",
    description:
      "Arts, marketing and communication careers are for expressive and creative types. You may contemplate a career in this field if you enjoy being inventive and original. Here are some examples.",
    careers: [
      {
        title: "Marketing manager",
        titleTh: "ผู้จัดการฝ่ายการตลาด",
        descriptionTh:
          "ผู้จัดการฝ่ายการตลาดดูแลกลยุทธ์การตลาดที่มุ่งเข้าถึงกลุ่มเป้าหมายของบริษัท ใช้ทักษะการวิเคราะห์และการค้นคว้าในการบริหารแคมเปญโฆษณาเชิงสร้างสรรค์และการสร้างแบรนด์ เป้าหมายหลักคือติดตามตลาดเพื่อใช้บริษัทหรือแบรนด์เข้าถึงลูกค้า",
        description:
          "Marketing managers are in charge of the marketing strategies that are aimed at a company's ideal target audience. They use analytical and research skills to manage creative advertising campaigns and branding. Their main goal is to track the market to use a company or brand to reach customers.",
        salary: "$102,067",
      },
      {
        title: "Photographer",
        titleTh: "ช่างภาพ",
        descriptionTh:
          "เป้าหมายหลักของช่างภาพคือการสร้างภาพคุณภาพสูงตามความต้องการของลูกค้า อาจทำงานในโรงเรียนและธุรกิจ รวมถึงงานอีเวนต์ เช่น งานแต่งงาน การแข่งขันกีฬา และแฟชั่นโชว์ ช่างภาพใช้อุปกรณ์และซอฟต์แวร์หลากหลาย และมักทำงานร่วมกับฝ่ายการตลาด",
        description:
          "A photographer's main goal is to produce high-quality images that meet the requirements of their client. They may work at schools and businesses, and also at events, such as weddings, sports events and fashion shows. Photographers use a variety of equipment and software. They often work with marketing departments.",
        salary: "$88,575",
      },
    ],
  },
  {
    title: "Careers in health science",
    titleTh: "อาชีพด้านวิทยาศาสตร์สุขภาพ",
    descriptionTh:
      "หากคุณมีใจรักในการช่วยเหลือผู้อื่น คุณอาจสนใจอาชีพในสายวิทยาศาสตร์สุขภาพ ด้านล่างคือตัวอย่างอาชีพ",
    picture:
      "https://storage.googleapis.com/public-tatugaschool/careers/health.png",
    blurhash: "LHM%cUof?^IB-:WWNyIooxNHWBax",
    description:
      "If you are passionate about helping others, you may be interested in a career in the health science sector. Here are some exemplary roles.",
    careers: [
      {
        title: "Physician",
        titleTh: "แพทย์",
        descriptionTh:
          "แพทย์มีบทบาทสำคัญอย่างยิ่งในวงการวิทยาศาสตร์สุขภาพ ให้การรักษาขั้นต้น วินิจฉัยโรค และวางแผนการฟื้นฟู แพทย์รับมือกับเหตุฉุกเฉิน รักษาอาการบาดเจ็บ และส่งเสริมสุขภาพด้วยการให้คำแนะนำเรื่องโภชนาการและการออกกำลังกาย",
        description:
          "Medical physicians are extremely important in the world of health science. They provide primary healthcare, diagnose illnesses and create rehabilitation plans. Physicians respond to emergencies, treat injuries and improve health by advising on nutrition and exercise.",
        salary: "$88,995",
      },
      {
        title: "Dental assistant",
        titleTh: "ผู้ช่วยทันตแพทย์",
        descriptionTh:
          "ผู้ช่วยทันตแพทย์มีบทบาทสำคัญในการช่วยทันตแพทย์ทำหัตถการ เตรียมผู้ป่วยก่อนการผ่าตัด ทำแบบพิมพ์ฟัน และจัดเตรียมรวมถึงทำความสะอาดบริเวณตรวจ หน้าที่สำคัญที่สุดอย่างหนึ่งคือการพูดคุยกับผู้ป่วยให้รู้สึกปลอดภัยและได้รับการดูแล",
        description:
          "Dental assistants are essential in assisting a dentist with procedures. They prepare patients for surgery, pour dental impressions and prepare and clean up examination areas. One of their most important roles is talking with patients and making them feel safe and cared for.",
        salary: "$52,651",
      },
    ],
  },
  {
    title: "Information technology",
    titleTh: "เทคโนโลยีสารสนเทศ",
    descriptionTh:
      "หากคุณชอบทำงานกับคอมพิวเตอร์หรือข้อมูล อาชีพด้านเทคโนโลยีสารสนเทศอาจเหมาะกับคุณ และสามารถทำงานด้านไอทีได้แม้ไม่มีปริญญา ด้านล่างคือตัวอย่างอาชีพด้านไอทีที่น่าสนใจ",
    picture:
      "https://storage.googleapis.com/public-tatugaschool/careers/technology.png",
    description:
      "If you enjoy working with computers or data, a career in information technology could be for you. It's possible to get a role in IT without a degree. Here are a few IT jobs to consider.",
    careers: [
      {
        title: "Web developer",
        titleTh: "นักพัฒนาเว็บไซต์",
        descriptionTh:
          "นักพัฒนาเว็บไซต์ออกแบบและสร้างเว็บไซต์ โดยมีเป้าหมายหลักให้ผู้ใช้ใช้งานเว็บไซต์ได้ง่ายไม่ติดขัด นักพัฒนาเว็บใช้ภาษาและเครื่องมือเขียนโปรแกรมที่ซับซ้อนหลายอย่าง เช่น HTML, JavaScript, Ruby on Rails และ C++ และทำงานได้แทบทุกอุตสาหกรรม ทั้งงานประจำ งานพาร์ตไทม์ หรือฟรีแลนซ์",
        description:
          "Web developers design and build websites. Their main goal of website creation is for users to have no difficulty navigating the site. Web developers use many complex coding programs such as HTML, JavaScript, Ruby on Rails and C++. Website developers can work in almost any industry, full-time, part-time or freelance.",
        salary: "$79,213",
      },
      {
        title: "Data entry clerk",
        titleTh: "พนักงานบันทึกข้อมูล",
        descriptionTh:
          "งานบันทึกข้อมูลคือการจัดการข้อมูลหลายรูปแบบ ทั้งข้อมูลอิเล็กทรอนิกส์และข้อมูลดิบ โดยแก้ไขและบันทึกข้อมูลลงในฐานข้อมูลหรือระบบ พนักงานบันทึกข้อมูลทำงานบนคอมพิวเตอร์ และมักใช้โปรแกรมประมวลผลข้อมูล",
        description:
          "A data entry job entails handling different types of electronic or raw data. They do this by editing and entering information into a database or platform. Data clerks do this on a computer, often using processing programs.",
        salary: "$59,106",
      },
    ],
  },
  {
    title: "Careers in law and public safety careers",
    titleTh: "อาชีพด้านกฎหมายและความปลอดภัยสาธารณะ",
    descriptionTh:
      "กฎหมาย ความปลอดภัยสาธารณะ งานราชทัณฑ์ และงานรักษาความปลอดภัย ล้วนเป็นทางเลือกอาชีพที่มั่นคง หากคุณชอบช่วยเหลือชุมชน อาชีพด้านกฎหมายและความปลอดภัยสาธารณะอาจเหมาะกับคุณ ด้านล่างคือตัวอย่างอาชีพในกลุ่มนี้",
    picture:
      "https://storage.googleapis.com/public-tatugaschool/careers/law.png",
    blurhash: "LKJkWJ|@zpVY~V+]wcR:JAD*xu-;",
    description:
      "Law, public safety, corrections and security are all strong career choices. If you enjoy helping the community, a career in law and public safety could be for you. Here are a couple of examples of jobs within this industry.",
    careers: [
      {
        title: "Firefighter",
        titleTh: "พนักงานดับเพลิง",
        descriptionTh:
          "พนักงานดับเพลิงมีหน้าที่ดับไฟและเป็นผู้เข้าช่วยเหลือกลุ่มแรกในเหตุฉุกเฉิน งานหลักคือช่วยเหลือผู้คนจากเหตุเพลิงไหม้ ช่วยเหลือผู้บาดเจ็บ และดับไฟ",
        description:
          "Firefighters are responsible for extinguishing fires and being first responders to emergencies. Their primary duties are rescuing people from fires, helping injured individuals and extinguishing fires.",
        salary: "$72,214",
      },
      {
        title: "Lawyer",
        titleTh: "ทนายความ",
        descriptionTh:
          "ทนายความให้คำแนะนำแก่ลูกความเกี่ยวกับสิทธิตามกฎหมาย รวมถึงค้นคว้าข้อมูลและเป็นตัวแทนลูกความในศาล",
        description:
          "Lawyers provide clients with recommendations about their legal rights. They also conduct research and represent clients in court.",
        salary: "$108,344",
      },
    ],
  },
  {
    title: "Science and Engineering",
    titleTh: "วิทยาศาสตร์และวิศวกรรม",
    descriptionTh:
      "อาชีพด้านวิทยาศาสตร์และวิศวกรรมเป็นรากฐานสำคัญของสังคมและการดำเนินชีวิตประจำวัน หากคุณต้องการอาชีพที่มีคุณค่าและรายได้สูง อาชีพต่อไปนี้อาจน่าพิจารณา",
    picture:
      "https://storage.googleapis.com/public-tatugaschool/careers/Science.png",
    blurhash: "L6Efsa9EU^*0^-H=.89Y00%#On$6",
    description:
      "Science and engineering careers are fundamental to society and its daily operations. If you want a rewarding career that pays a high salary, then the following jobs may be worth considering.",
    careers: [
      {
        title: "Mechanical engineer",
        titleTh: "วิศวกรเครื่องกล",
        descriptionTh:
          "หน้าที่หลักของวิศวกรเครื่องกลคือวิเคราะห์ปัญหาเพื่อหาว่าอุปกรณ์เครื่องกลจะช่วยแก้ปัญหาได้อย่างไร รับผิดชอบด้านการผลิต การใช้ และการกระจายพลังงาน รวมถึงทดสอบต้นแบบและตรวจสอบสาเหตุที่ระบบขัดข้อง",
        description:
          "A mechanical engineer's primary duties include analysing issues to determine how mechanical devices may solve the problem. They are responsible for the generation, use and distribution of energy. Mechanical engineers test prototypes and investigate system failures.",
        salary: "$86,337",
      },
      {
        title: "Biologist",
        titleTh: "นักชีววิทยา",
        descriptionTh:
          "นักชีววิทยาศึกษาสิ่งแวดล้อม งานหลักคือการทดสอบและทดลอง ทำวิจัย และเก็บตัวอย่าง",
        description:
          "A biologist studies the environment. Their primary duties include performing tests and experiments, conducting research and collecting samples.",
        salary: "$90,710",
      },
    ],
  },
  {
    title: "Travel and Services",
    titleTh: "การท่องเที่ยวและการบริการ",
    descriptionTh:
      "อาชีพด้านการท่องเที่ยวและการบริการมีทั้งงานโดยตรง เช่น พนักงานต้อนรับบนเครื่องบิน มัคคุเทศก์ และพนักงานบนเรือสำราญ และงานที่เกี่ยวข้อง เช่น ตัวแทนท่องเที่ยว ผู้จัดการโรงแรม และฝ่ายสำรองที่พักขององค์กร งานเหล่านี้มักเกี่ยวกับการบริการลูกค้า การต้อนรับ และความรักในการเดินทาง มีโอกาสตั้งแต่งานด่านหน้าไปจนถึงงานบริหารและงานเฉพาะทาง",
    picture:
      "https://storage.googleapis.com/public-tatugaschool/careers/Travel%20and%20Services.png",
    blurhash: "L6Efsa9EU^*0^-H=.89Y00%#On$6",
    description:
      "Careers in travel and services include direct roles like flight attendant, tour guide, and cruise ship staff, as well as related fields such as travel agent, hotel manager, and corporate reservations. These jobs often involve customer service, hospitality, and a love for travel, with opportunities ranging from front-line positions to management and specialized roles. ",
    careers: [
      {
        title: "Flight Attendant",
        titleTh: "พนักงานต้อนรับบนเครื่องบิน",
        descriptionTh:
          "ดูแลความปลอดภัยและความสะดวกสบายของผู้โดยสารบนเครื่องบิน และมีโอกาสได้เดินทางไปยังจุดหมายต่าง ๆ",
        description:
          "Manages passenger safety and comfort on aircraft, with the ability to travel to various destinations.",
        salary: "$86,337",
      },
      {
        title: "Tour Guide",
        titleTh: "มัคคุเทศก์",
        descriptionTh:
          "นำกลุ่มนักท่องเที่ยวและให้ข้อมูลเกี่ยวกับสถานที่หรือแหล่งท่องเที่ยว",
        description:
          "Leads groups of tourists, providing information about a specific location or attraction.",
        salary: "$90,710",
      },
      {
        title: "Hotel Staff",
        titleTh: "พนักงานโรงแรม",
        descriptionTh:
          "รวมถึงตำแหน่งต่าง ๆ เช่น แม่บ้าน พนักงานต้อนรับส่วนหน้า และผู้จัดการโรงแรม",
        description:
          "Includes roles like housekeeper, front desk agent, and hotel manager. ",
        salary: "$90,710",
      },
    ],
  },
  {
    title: "Arts, marketing & communication",
    titleTh: "ศิลปะ การตลาด และการสื่อสาร",
    descriptionTh:
      "อาชีพด้านศิลปะ การตลาด และการสื่อสารเน้นความคิดสร้างสรรค์ การแสดงออก และการสื่อสารข้อความ มีตั้งแต่งานด้านทัศนศิลป์และศิลปะการแสดง เช่น นักออกแบบกราฟิกหรือนักดนตรี ไปจนถึงงานเชิงกลยุทธ์ด้านการตลาด เช่น ผู้จัดการแบรนด์หรือนักวางกลยุทธ์ดิจิทัล และงานด้านการสื่อสาร เช่น การประชาสัมพันธ์หรือการเขียนเชิงเทคนิค งานเหล่านี้เกี่ยวกับการสร้างเนื้อหา การเชื่อมต่อกับผู้ชม และการสร้างอัตลักษณ์ของแบรนด์",
    picture:
      "https://storage.googleapis.com/public-tatugaschool/careers/Arts%2C%20marketing%20%26%20communication.png",
    blurhash: "L6Efsa9EU^*0^-H=.89Y00%#On$6",
    description:
      "Careers in arts, marketing, and communication focus on creativity, expression, and messaging. Roles can range from visual and performing arts, like graphic designer or musician, to strategic business roles in marketing, like brand manager or digital strategist, and communication fields like public relations or technical writing. These jobs involve creating content, connecting with audiences, and building brand identity.",
    careers: [
      {
        title: "Graphic Designer",
        titleTh: "นักออกแบบกราฟิก",
        descriptionTh:
          "สร้างแนวคิดทางภาพด้วยซอฟต์แวร์คอมพิวเตอร์หรือด้วยมือ เพื่อสื่อสารแนวคิดที่สร้างแรงบันดาลใจ ให้ข้อมูล หรือดึงดูดผู้บริโภค",
        description:
          "Creates visual concepts, using computer software or by hand, to communicate ideas that inspire, inform, or captivate consumers.",
        salary: "$59,840",
      },
      {
        title: "Marketing Manager",
        titleTh: "ผู้จัดการฝ่ายการตลาด",
        descriptionTh:
          "พัฒนาและนำกลยุทธ์การตลาดไปใช้เพื่อส่งเสริมสินค้าหรือบริการของบริษัท โดยวิเคราะห์แนวโน้มตลาดและบริหารแคมเปญ",
        description:
          "Develops and implements marketing strategies to promote a company's products or services by analyzing market trends and managing campaigns.",
        salary: "$138,730",
      },
      {
        title: "Public Relations Specialist",
        titleTh: "เจ้าหน้าที่ประชาสัมพันธ์",
        descriptionTh:
          "ดูแลภาพลักษณ์ต่อสาธารณะของลูกค้าหรือองค์กร เขียนข่าวประชาสัมพันธ์ และสร้างความสัมพันธ์กับสื่อมวลชนและสาธารณชน",
        description:
          "Manages the public image of a client or organization, writing press releases and building relationships with media and the public.",
        salary: "$67,440",
      },
    ],
  },
];
