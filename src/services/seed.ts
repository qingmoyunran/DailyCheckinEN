// 初始真题数据 - 来自 TestPaper 目录的历年高考听力真题
import {
  addCourse,
  addLesson,
  addQuestion,
  getCourses,
} from "./db";
import type { Difficulty } from "@/types";

export function seedDataIfEmpty(): void {
  const existingCourses = getCourses();
  if (existingCourses.length > 0) return;

  // ============ 2025 全国一卷 ============
  const course1Id = addCourse({
    title: "2025 全国一卷听力真题",
    description: "2025 年全国统一高考英语听力真题（全国一卷），共 20 题，包含短对话、长对话与独白。",
    difficulty: "medium" as Difficulty,
    category: "高考真题",
  });

  // 第一节：短对话（1-5题）
  const lesson1_1 = addLesson({
    course_id: course1Id,
    title: "第一节 短对话（1-5题）",
    script_text: "Text 1\nM: I can't find my suitcase.\nW: Can you describe it, sir? Fill out this form first.\n\nText 2\nM: Sarah, what are you going to do after you graduate?\nW: I plan to do some volunteer work before looking for a job.\n\nText 3\nM: We need to move. This house is too small for our family.\nW: I know. The window in the bedroom is broken, too.\n\nText 4\nM: How was your first skiing experience?\nW: It was fun, but the ski area was a bit crowded.\n\nText 5\nM: Are we going the right way to the Grand Theatre?\nW: I think so. We just passed the Art Centre and the Stone Bridge is behind us.",
    audio_url: "./audio/2025_national_1.mp3",
    duration: 300,
  });

  addQuestion({ lesson_id: lesson1_1, question_text: "What will the man do next?", option_a: "Unpack his suitcase.", option_b: "Board a flight.", option_c: "Fill out a form.", option_d: "", correct_answer: "C", audio_url: "", explanation: "女士说 'Fill out this form first'，所以男士接下来要填表。", year: 2025 });
  addQuestion({ lesson_id: lesson1_1, question_text: "What does Sarah plan to do after graduation?", option_a: "Do volunteer work.", option_b: "Pursue a higher degree.", option_c: "Run the family business.", option_d: "", correct_answer: "A", audio_url: "", explanation: "Sarah 说 'I plan to do some volunteer work'，毕业后计划做志愿者工作。", year: 2025 });
  addQuestion({ lesson_id: lesson1_1, question_text: "What are the speakers talking about?", option_a: "Buying a car.", option_b: "Moving house.", option_c: "Fixing the window.", option_d: "", correct_answer: "B", audio_url: "", explanation: "男士说 'We need to move'，他们在讨论搬家。", year: 2025 });
  addQuestion({ lesson_id: lesson1_1, question_text: "What does the woman think of the ski area?", option_a: "It's a bit crowded.", option_b: "It has poor snow.", option_c: "It's too far away.", option_d: "", correct_answer: "A", audio_url: "", explanation: "女士说 'the ski area was a bit crowded'，认为滑雪场有点拥挤。", year: 2025 });
  addQuestion({ lesson_id: lesson1_1, question_text: "Where are the speakers heading?", option_a: "The Art Centre.", option_b: "The Grand Theatre.", option_c: "The Stone Bridge.", option_d: "", correct_answer: "B", audio_url: "", explanation: "男士问去 Grand Theatre 的路，他们正前往大剧院。", year: 2025 });

  // 第二节：长对话（6-10题）
  const lesson1_2 = addLesson({
    course_id: course1Id,
    title: "第二节 长对话（6-10题）",
    script_text: "Text 6\nM: Ma'am, I stopped you because you were going over the speed limit.\nW: I'm sorry, officer. I didn't realize.\nM: This is a school zone. The speed limit is 20 miles per hour. School finishes at 2:00 pm on Wednesdays.\nW: I'll be more careful next time.\n\nText 7\nM: Grace? Is that you?\nW: Kevin! What a surprise!\nM: Are you still working at the same company?\nW: No, I changed jobs last year. I'm at Jennifer's firm now.\nM: We should catch up. Would you like to have dinner?\nW: I'd love to, but I'm having dinner with David tonight.\nM: That's okay. I'll just go say hi to a friend over there.",
    audio_url: "./audio/2025_national_1.mp3",
    duration: 300,
  });

  addQuestion({ lesson_id: lesson1_2, question_text: "What did the woman do?", option_a: "She went over the speed limit.", option_b: "She parked in a school zone.", option_c: "She drove through a red light.", option_d: "", correct_answer: "A", audio_url: "", explanation: "警察说 'you were going over the speed limit'，女士超速了。", year: 2025 });
  addQuestion({ lesson_id: lesson1_2, question_text: "What time does school finish on Wednesdays?", option_a: "At 2:00 pm.", option_b: "At 2:30 pm.", option_c: "At 3:30 pm.", option_d: "", correct_answer: "A", audio_url: "", explanation: "警察说 'School finishes at 2:00 pm on Wednesdays'。", year: 2025 });
  addQuestion({ lesson_id: lesson1_2, question_text: "What is the relationship between the speakers?", option_a: "Fellow workers.", option_b: "Former schoolmates.", option_c: "Family relatives.", option_d: "", correct_answer: "B", audio_url: "", explanation: "两人互相认识且谈论过去的工作，是以前的校友。", year: 2025 });
  addQuestion({ lesson_id: lesson1_2, question_text: "Who will Grace have dinner with?", option_a: "Fiona.", option_b: "Jennifer.", option_c: "David.", option_d: "", correct_answer: "C", audio_url: "", explanation: "Grace 说 'I'm having dinner with David tonight'。", year: 2025 });
  addQuestion({ lesson_id: lesson1_2, question_text: "What is Kevin going to do next?", option_a: "Buy a drink.", option_b: "Play basketball.", option_c: "Greet a friend.", option_d: "", correct_answer: "C", audio_url: "", explanation: "Kevin 说 'I'll just go say hi to a friend over there'，他要去跟朋友打招呼。", year: 2025 });

  // 第二节：长对话（11-13题）
  const lesson1_3 = addLesson({
    course_id: course1Id,
    title: "第二节 长对话（11-13题）",
    script_text: "Text 8\nM: Have you noticed that there are fewer news programs on TV these days?\nW: Yes. They have been reduced in number. More time is given to reality shows.\nM: I actually enjoy reality shows. They're entertaining.\nW: But I think TV programs should be more educational. They should teach people something useful.",
    audio_url: "./audio/2025_national_1.mp3",
    duration: 300,
  });

  addQuestion({ lesson_id: lesson1_3, question_text: "What does the woman say about news programs?", option_a: "They are replaced by documentaries.", option_b: "They have been reduced in number.", option_c: "They focus on the life of celebrities.", option_d: "", correct_answer: "B", audio_url: "", explanation: "女士说 'They have been reduced in number'，新闻节目数量减少了。", year: 2025 });
  addQuestion({ lesson_id: lesson1_3, question_text: "What is the man's attitude toward reality shows?", option_a: "Favorable.", option_b: "Critical.", option_c: "Uncertain.", option_d: "", correct_answer: "A", audio_url: "", explanation: "男士说 'I actually enjoy reality shows'，对真人秀持赞成态度。", year: 2025 });
  addQuestion({ lesson_id: lesson1_3, question_text: "What does the woman expect TV programs to be?", option_a: "Educational.", option_b: "Diverse.", option_c: "Entertaining.", option_d: "", correct_answer: "A", audio_url: "", explanation: "女士说 'I think TV programs should be more educational'。", year: 2025 });

  // 第二节：长对话与独白（14-20题）
  const lesson1_4 = addLesson({
    course_id: course1Id,
    title: "第二节 长对话与独白（14-20题）",
    script_text: "Text 9 — School Program\nW: Welcome to our school program, Cathy.\nM: Thank you. Our program invites adults to visit the school and observe classes.\nW: How do students benefit?\nM: They learn about adults' lives and careers. The goal is to enhance school-community interaction.\n\nText 10 — Climate Change Art Project\nOur city is located on the coast. We put up signs with numbers showing the height above sea level. The success of this project indicates that art can make a difference in raising awareness about climate change.",
    audio_url: "./audio/2025_national_1.mp3",
    duration: 300,
  });

  addQuestion({ lesson_id: lesson1_4, question_text: "Who is Cathy?", option_a: "A school teacher.", option_b: "A radio host.", option_c: "A government official.", option_d: "", correct_answer: "B", audio_url: "", explanation: "Cathy 是节目主持人。", year: 2025 });
  addQuestion({ lesson_id: lesson1_4, question_text: "What can the visiting adults do in the school?", option_a: "Give speeches.", option_b: "Observe classes.", option_c: "Organize activities.", option_d: "", correct_answer: "B", audio_url: "", explanation: "项目邀请成年人来学校旁听课程。", year: 2025 });
  addQuestion({ lesson_id: lesson1_4, question_text: "How can the students benefit from the school program?", option_a: "Earn extra credits.", option_b: "Find job opportunities.", option_c: "Learn about adults' life.", option_d: "", correct_answer: "C", audio_url: "", explanation: "学生可以了解成年人的生活和工作。", year: 2025 });
  addQuestion({ lesson_id: lesson1_4, question_text: "What is the goal of the school program?", option_a: "To improve student-teacher relationship.", option_b: "To promote the idea of work-life balance.", option_c: "To enhance school-community interaction.", option_d: "", correct_answer: "C", audio_url: "", explanation: "项目目标是加强学校与社区的互动。", year: 2025 });
  addQuestion({ lesson_id: lesson1_4, question_text: "Where is the speaker's city located?", option_a: "By the lake.", option_b: "On the coast.", option_c: "In the valley.", option_d: "", correct_answer: "B", audio_url: "", explanation: "说话者说 'Our city is located on the coast'。", year: 2025 });
  addQuestion({ lesson_id: lesson1_4, question_text: "What do the numbers on the signs stand for?", option_a: "The duration of flooding.", option_b: "The rise in air temperature.", option_c: "The height above sea level.", option_d: "", correct_answer: "C", audio_url: "", explanation: "标志上的数字代表海拔高度。", year: 2025 });
  addQuestion({ lesson_id: lesson1_4, question_text: "What does the success of the project indicate?", option_a: "Art can make a difference.", option_b: "The homeowners are creative.", option_c: "Climate change is controllable.", option_d: "", correct_answer: "A", audio_url: "", explanation: "项目的成功表明艺术可以发挥作用。", year: 2025 });

  // ============ 2025 全国二卷 ============
  const course2Id = addCourse({
    title: "2025 全国二卷听力真题",
    description: "2025 年全国统一高考英语听力真题（全国二卷），共 20 题，涵盖日常对话与独白。",
    difficulty: "medium" as Difficulty,
    category: "高考真题",
  });

  const lesson2_1 = addLesson({
    course_id: course2Id,
    title: "第一节 短对话（1-5题）",
    script_text: "Text 1\nW: Excuse me, is this bus going to Baxley?\nM: No. See the yellow taxi on the corner? Turn left there to Madison Street and take Bus No.4.\nW: All right, thank you!\n\nText 2\nM: Just bring us the bill, please.\nW: Right away, sir.\n\nText 3\nW: Dad, I can't afford that computer, but I think I really need it for my research.\nM: Don't worry, Alice. Just pay as much as you can and I'll make up the rest.\n\nText 4\nW: What are you studying?\nM: I study Biology.\n\nText 5\nW: Gee, you broke Mary's sport watch!\nM: I'm so sorry. We'll have it fixed.",
    audio_url: "./audio/2025_national_2.mp3",
    duration: 300,
  });

  addQuestion({ lesson_id: lesson2_1, question_text: "How will the woman probably get to Baxley?", option_a: "On foot.", option_b: "By taxi.", option_c: "By bus.", option_d: "", correct_answer: "C", audio_url: "", explanation: "男士建议女士乘 4 路公交车去 Baxley。", year: 2025 });
  addQuestion({ lesson_id: lesson2_1, question_text: "What is the man going to do?", option_a: "Have some dessert.", option_b: "Pay the bill.", option_c: "Cancel the trip.", option_d: "", correct_answer: "B", audio_url: "", explanation: "男士说 'Just bring us the bill'，他要结账。", year: 2025 });
  addQuestion({ lesson_id: lesson2_1, question_text: "What are the speakers talking about?", option_a: "Buying a computer.", option_b: "Doing research.", option_c: "Saving money.", option_d: "", correct_answer: "A", audio_url: "", explanation: "女儿说买不起电脑但需要它做研究，爸爸说会补足差额，他们在讨论买电脑。", year: 2025 });
  addQuestion({ lesson_id: lesson2_1, question_text: "What is the man's major?", option_a: "Psychology.", option_b: "Biology.", option_c: "English.", option_d: "", correct_answer: "B", audio_url: "", explanation: "男士说 'I study Biology'。", year: 2025 });
  addQuestion({ lesson_id: lesson2_1, question_text: "What does Linda suggest?", option_a: "Buying a sports watch.", option_b: "Borrowing Mary's watch.", option_c: "Getting the watch repaired.", option_d: "", correct_answer: "C", audio_url: "", explanation: "Linda 说 'We'll have it fixed'，建议修手表。", year: 2025 });

  const lesson2_2 = addLesson({
    course_id: course2Id,
    title: "第二节 长对话（6-10题）",
    script_text: "Text 6\nM: Hi, Delia, this is Peter. Are you doing anything Tuesday evening? I've got two tickets for the National Theatre. Would you like to come?\nW: I'd love to.\nM: Shall I meet you at your office at 6:00?\nW: Sounds great.\n\nText 7\nW: Sam, how's your daughter doing at school?\nM: Since I bought a smartphone for Julia last summer, it seems the phone has become an extension of her arm. And it has made it impossible for her to concentrate.\nW: Has the school done anything about it?\nM: Yes, they've introduced some policies. I'm all in favor of these policies.\nW: That's understandable, honey.",
    audio_url: "./audio/2025_national_2.mp3",
    duration: 300,
  });

  addQuestion({ lesson_id: lesson2_2, question_text: "Why does Peter make the call?", option_a: "To arrange a visit.", option_b: "To extend an invitation.", option_c: "To confirm an appointment.", option_d: "", correct_answer: "B", audio_url: "", explanation: "Peter 打电话邀请 Delia 去国家剧院。", year: 2025 });
  addQuestion({ lesson_id: lesson2_2, question_text: "Where will the speakers meet on Tuesday evening?", option_a: "At the theatre.", option_b: "At a snack bar.", option_c: "At Delia's office.", option_d: "", correct_answer: "C", audio_url: "", explanation: "Peter 说 'Shall I meet you at your office at 6:00'。", year: 2025 });
  addQuestion({ lesson_id: lesson2_2, question_text: "What does Sam say about his daughter?", option_a: "She dislikes doing homework.", option_b: "She overuses her smartphone.", option_c: "She feels lonely at school.", option_d: "", correct_answer: "B", audio_url: "", explanation: "Sam 说手机成了女儿手臂的延伸，她过度使用手机。", year: 2025 });
  addQuestion({ lesson_id: lesson2_2, question_text: "What is Sam's attitude towards the school policies?", option_a: "Supportive.", option_b: "Uncertain.", option_c: "Disapproving.", option_d: "", correct_answer: "A", audio_url: "", explanation: "Sam 说 'I'm all in favor of these policies'，持支持态度。", year: 2025 });
  addQuestion({ lesson_id: lesson2_2, question_text: "What is the probable relationship between the speakers?", option_a: "Tourist and guide.", option_b: "Husband and wife.", option_c: "Trainer and trainee.", option_d: "", correct_answer: "B", audio_url: "", explanation: "对话中的称呼 'honey' 表明两人是夫妻关系。", year: 2025 });

  const lesson2_3 = addLesson({
    course_id: course2Id,
    title: "第二节 长对话（11-16题）",
    script_text: "Text 8\nM: Billy suggested we go rock climbing.\nW: That sounds exciting! What about Jessie?\nM: She's planning to go rowing on the lake tomorrow.\n\nText 9\nM: I just had a job interview before coming here.\nW: How did it go?\nM: I hope to get a promotion. I'll know the result on Wednesday.\nW: Who is Susanna?\nM: She's my boss.",
    audio_url: "./audio/2025_national_2.mp3",
    duration: 300,
  });

  addQuestion({ lesson_id: lesson2_3, question_text: "Who came up with the idea of going rock climbing?", option_a: "Billy.", option_b: "Karen.", option_c: "Max.", option_d: "", correct_answer: "A", audio_url: "", explanation: "男士说 'Billy suggested we go rock climbing'。", year: 2025 });
  addQuestion({ lesson_id: lesson2_3, question_text: "What is Jessie's plan for tomorrow?", option_a: "Going horseback riding.", option_b: "Playing table tennis.", option_c: "Rowing on the lake.", option_d: "", correct_answer: "C", audio_url: "", explanation: "Jessie 计划明天去湖上划船。", year: 2025 });
  addQuestion({ lesson_id: lesson2_3, question_text: "What did Frank do before coming to Susanna?", option_a: "He went to a tech fair.", option_b: "He signed a contract.", option_c: "He had a job interview.", option_d: "", correct_answer: "C", audio_url: "", explanation: "Frank 来之前参加了面试。", year: 2025 });
  addQuestion({ lesson_id: lesson2_3, question_text: "What does Frank hope to get?", option_a: "A promotion.", option_b: "A vacation.", option_c: "A bonus.", option_d: "", correct_answer: "A", audio_url: "", explanation: "Frank 希望获得晋升。", year: 2025 });
  addQuestion({ lesson_id: lesson2_3, question_text: "When will Frank know the result from his company?", option_a: "Wednesday.", option_b: "Thursday.", option_c: "Friday.", option_d: "", correct_answer: "A", audio_url: "", explanation: "Frank 说周三会知道结果。", year: 2025 });
  addQuestion({ lesson_id: lesson2_3, question_text: "Who is Susanna?", option_a: "Frank's client.", option_b: "Frank's lawyer.", option_c: "Frank's boss.", option_d: "", correct_answer: "C", audio_url: "", explanation: "Frank 说 Susanna 是他的老板。", year: 2025 });

  const lesson2_4 = addLesson({
    course_id: course2Id,
    title: "第二节 独白（17-20题）",
    script_text: "Text 10 — Summer Camp\nThe Mini Camp is intended for four-year-olds. The Older Summer Camp organizes bowling games. A requirement for joining the field trips is parental permission. What will the speaker do next? Show a short video.",
    audio_url: "./audio/2025_national_2.mp3",
    duration: 300,
  });

  addQuestion({ lesson_id: lesson2_4, question_text: "Who is the Mini Camp intended for?", option_a: "Four-year-olds.", option_b: "Five-year-olds.", option_c: "Six-year-olds.", option_d: "", correct_answer: "A", audio_url: "", explanation: "Mini Camp 是为四岁儿童设计的。", year: 2025 });
  addQuestion({ lesson_id: lesson2_4, question_text: "Which activity does the Older Summer Camp organize?", option_a: "Museum visits.", option_b: "Bowling games.", option_c: "Family gatherings.", option_d: "", correct_answer: "B", audio_url: "", explanation: "大龄夏令营组织保龄球活动。", year: 2025 });
  addQuestion({ lesson_id: lesson2_4, question_text: "What is a requirement for joining the field trips?", option_a: "Camping experience.", option_b: "Parental permission.", option_c: "Swimming skills.", option_d: "", correct_answer: "B", audio_url: "", explanation: "参加实地考察需要家长许可。", year: 2025 });
  addQuestion({ lesson_id: lesson2_4, question_text: "What will the speaker do next?", option_a: "Collect fees.", option_b: "Answer questions.", option_c: "Show a short video.", option_d: "", correct_answer: "C", audio_url: "", explanation: "演讲者接下来会播放短视频。", year: 2025 });

  // ============ 2026 全国一卷 ============
  const course3Id = addCourse({
    title: "2026 全国一卷听力真题",
    description: "2026 年全国统一高考英语听力真题（全国一卷），共 20 题，最新真题。",
    difficulty: "hard" as Difficulty,
    category: "高考真题",
  });

  const lesson3_1 = addLesson({
    course_id: course3Id,
    title: "第一节 短对话（1-5题）",
    script_text: "Text 1\nM: Do I need a card to enter the building?\nW: Yes. You'll get your card this afternoon. Now let me show you around and say hello to everyone.\n\nText 2\nW: Would you like some more roast beef? It's the chef's signature dish.\nM: No, thanks. It's really good. But I can't manage any more.\n\nText 3\nW: Hey, look at this one in the newspaper: fishermen fishing at Lake Victoria in Tanzania.\nM: Wow, the unique atmosphere is perfectly caught by the photographer.\n\nText 4\nW: It's almost midnight, Max. You've got a long drive tomorrow.\nM: Okay. Another fifteen minutes from my travel blog. And I'll be done.\n\nText 5\nW: Hello, Mr. Waterman. This is Sarah Jones. I'm stuck on the highway. There's a serious accident. I'm afraid I can't arrive before noon. Could we meet this afternoon?\nM: Okay. I'll see my doctor at one and will be available after two.",
    audio_url: "./audio/2026_national_1.mp3",
    duration: 300,
  });

  addQuestion({ lesson_id: lesson3_1, question_text: "Who is the man?", option_a: "A business client.", option_b: "A job applicant.", option_c: "A new staff member.", option_d: "", correct_answer: "C", audio_url: "", explanation: "女士说会带他参观并介绍给所有人，还要讨论工作职责，说明他是新员工。", year: 2026 });
  addQuestion({ lesson_id: lesson3_1, question_text: "Where does the conversation probably take place?", option_a: "In an office.", option_b: "In a restaurant.", option_c: "In a grocery store.", option_d: "", correct_answer: "B", audio_url: "", explanation: "对话提到 'roast beef' 和 'chef's signature dish'，发生在餐厅。", year: 2026 });
  addQuestion({ lesson_id: lesson3_1, question_text: "What are the speakers talking about?", option_a: "A picture.", option_b: "A fisherman.", option_c: "A country.", option_d: "", correct_answer: "A", audio_url: "", explanation: "他们在讨论报纸上的一张照片。", year: 2026 });
  addQuestion({ lesson_id: lesson3_1, question_text: "What does the woman suggest Max do?", option_a: "Go to bed.", option_b: "Drive carefully.", option_c: "Update his blog.", option_d: "", correct_answer: "A", audio_url: "", explanation: "女士说快到午夜了而且明天要开长途车，暗示 Max 该睡觉了。", year: 2026 });
  addQuestion({ lesson_id: lesson3_1, question_text: "Why does Sarah make the phone call?", option_a: "To request sick leave.", option_b: "To make a complaint.", option_c: "To postpone a meeting.", option_d: "", correct_answer: "C", audio_url: "", explanation: "Sarah 因高速公路事故无法按时到达，请求推迟会议。", year: 2026 });

  const lesson3_2 = addLesson({
    course_id: course3Id,
    title: "第二节 长对话（6-10题）",
    script_text: "Text 6\nM: Lisa, you're English, but you live here. What do you love about Copenhagen?\nW: It has everything big cities offer — cafes, theaters, museums — but it is still relaxing and manageable. Unlike London, you don't feel constant pressure here.\nM: Was this lifestyle why you first came?\nW: No, I originally came for a three-month project at a law firm. After finishing it, they offered me a permanent job.\n\nText 7\nM: Hello, this is Mike from Gilbert company. We'd like to book a dinner for next Tuesday.\nW: How many guests and what budget?\nM: Twenty people, thirty pounds per person.\nW: What's the occasion?\nM: It's to honor a staff member who is retiring next month.\nW: Would you like a detailed menu with prices?\nM: Yes. Could you email it to Mike Lee at Gilbert.com?",
    audio_url: "./audio/2026_national_1.mp3",
    duration: 300,
  });

  addQuestion({ lesson_id: lesson3_2, question_text: "What makes Copenhagen different from London in Lisa's eyes?", option_a: "A less stressful life.", option_b: "Better city planning.", option_c: "More tourist sites.", option_d: "", correct_answer: "A", audio_url: "", explanation: "Lisa 说在哥本哈根不像伦敦那样感到持续压力，生活更轻松。", year: 2026 });
  addQuestion({ lesson_id: lesson3_2, question_text: "Why did Lisa originally come to Copenhagen?", option_a: "To look for a permanent job.", option_b: "To do a short-term project.", option_c: "To visit a famous museum.", option_d: "", correct_answer: "B", audio_url: "", explanation: "Lisa 最初是因为一个三个月的项目来哥本哈根的。", year: 2026 });
  addQuestion({ lesson_id: lesson3_2, question_text: "What is the total budget for the dinner?", option_a: "£200.", option_b: "£300.", option_c: "£600.", option_d: "", correct_answer: "C", audio_url: "", explanation: "20人 × £30/人 = £600。", year: 2026 });
  addQuestion({ lesson_id: lesson3_2, question_text: "What occasion is the dinner for?", option_a: "The retirement of an employee.", option_b: "The launch of a new product.", option_c: "The opening of a branch office.", option_d: "", correct_answer: "A", audio_url: "", explanation: "晚餐是为了纪念一位即将退休的员工。", year: 2026 });
  addQuestion({ lesson_id: lesson3_2, question_text: "What is the woman going to do for Mr. Lee?", option_a: "Take his order.", option_b: "Bring him the bill.", option_c: "Email him a menu.", option_d: "", correct_answer: "C", audio_url: "", explanation: "女士说会把菜单发到 Mr. Lee 的邮箱。", year: 2026 });

  const lesson3_3 = addLesson({
    course_id: course3Id,
    title: "第二节 长对话（11-13题）",
    script_text: "Text 8\nW: The song we've just heard was made with an AI version of Jenny's singing voice.\nM: Jenny announced that she'd let anybody make a song using her AI voice as long as they shared their profits with her. In just a few weeks, more than three hundred new songs were created.\nW: Incredible. This could be an attractive new business model for a pop star.\nM: But some listeners want to hear Jenny's real voice. Now let's play one of her greatest hits: Show me your love.",
    audio_url: "./audio/2026_national_1.mp3",
    duration: 300,
  });

  addQuestion({ lesson_id: lesson3_3, question_text: "What does Jenny do?", option_a: "She's an AI engineer.", option_b: "She's a pop singer.", option_c: "She's a radio host.", option_d: "", correct_answer: "B", audio_url: "", explanation: "Jenny 是流行歌手，她的 AI 声音被用来制作歌曲。", year: 2026 });
  addQuestion({ lesson_id: lesson3_3, question_text: "How does the woman feel about what Jenny has done?", option_a: "It might cause legal problems.", option_b: "It would benefit the community.", option_c: "It could be a profitable business.", option_d: "", correct_answer: "C", audio_url: "", explanation: "女士说 'This could be an attractive new business model'，认为这可能是一种有利可图的商业模式。", year: 2026 });
  addQuestion({ lesson_id: lesson3_3, question_text: "What will the man do next?", option_a: "Play a song.", option_b: "Contact a listener.", option_c: "Recommend a show.", option_d: "", correct_answer: "A", audio_url: "", explanation: "男士说 'Now let's play one of her greatest hits'，接下来会播放歌曲。", year: 2026 });

  const lesson3_4 = addLesson({
    course_id: course3Id,
    title: "第二节 长对话与独白（14-20题）",
    script_text: "Text 9\nM: Dr. Evans, you just said that these ancient texts are actually the recipes from ancient Babylonia.\nW: Ancient Babylonia is home to many of the things that we use in our cooking today. About fifty percent of the energy you need every day comes from food that originated in this area.\nM: Why have these texts taken so long to come to light?\nW: These ancient texts have been known since the 1920s but were thought to be medical texts. In the 1940s, Mary Hussey suggested that they might be about food. But people didn't believe her until French author Jean Bottero proved it in the 1980s.\n\nText 10\nBefore we begin today's experiment, let's review the lab rules. First, safety glasses must be worn at all times. If any chemical container is knocked over, tell me immediately. We will work in pairs. Switch roles after every three trials to ensure everyone gets practice. If you finish early, clean your workspace thoroughly.",
    audio_url: "./audio/2026_national_1.mp3",
    duration: 300,
  });

  addQuestion({ lesson_id: lesson3_4, question_text: "What does Evans say about ancient Babylonia?", option_a: "It is rich in energy resources.", option_b: "It is home to several languages.", option_c: "It is the birthplace of many foods.", option_d: "", correct_answer: "C", audio_url: "", explanation: "Evans 说古巴比伦是许多食物的发源地。", year: 2026 });
  addQuestion({ lesson_id: lesson3_4, question_text: "What did people initially think the ancient texts were about?", option_a: "Cookery.", option_b: "Medicine.", option_c: "Education.", option_d: "", correct_answer: "B", audio_url: "", explanation: "人们最初认为这些古代文献是医学文献。", year: 2026 });
  addQuestion({ lesson_id: lesson3_4, question_text: "What do we know about the French author Jean Bottero?", option_a: "He proved Mary Hussey right.", option_b: "He taught history at Yale University.", option_c: "He was the first to translate the texts.", option_d: "", correct_answer: "A", audio_url: "", explanation: "Jean Bottero 在 1980 年代证实了 Mary Hussey 的观点是正确的。", year: 2026 });
  addQuestion({ lesson_id: lesson3_4, question_text: "What must the students wear when doing the experiment?", option_a: "Loose clothes.", option_b: "Protective glasses.", option_c: "Waterproof caps.", option_d: "", correct_answer: "B", audio_url: "", explanation: "老师要求实验时必须佩戴护目镜。", year: 2026 });
  addQuestion({ lesson_id: lesson3_4, question_text: "What should the students do if they knock over a chemical container?", option_a: "Report to the teacher.", option_b: "Clear up the mess.", option_c: "Check the instructions.", option_d: "", correct_answer: "A", audio_url: "", explanation: "老师说如果打翻化学品容器要立即报告老师。", year: 2026 });
  addQuestion({ lesson_id: lesson3_4, question_text: "Why should the students switch roles?", option_a: "To speed up the experiment.", option_b: "To double-check the final results.", option_c: "To get an equal chance to practice.", option_d: "", correct_answer: "C", audio_url: "", explanation: "交换角色是为了确保每个人都有练习的机会。", year: 2026 });
  addQuestion({ lesson_id: lesson3_4, question_text: "What should the students do if they finish early?", option_a: "Analyze the data.", option_b: "Clean their workspace.", option_c: "Start a new experiment.", option_d: "", correct_answer: "B", audio_url: "", explanation: "老师说如果提前完成，要彻底清理工作区。", year: 2026 });
}
