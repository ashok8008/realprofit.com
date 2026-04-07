"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MessageSquare, Brain, Star, Building } from "lucide-react";
import { saveToStorage, loadFromStorage, clearStorage } from "@/lib/career-tools/storage";
import { useToast } from "@/hooks/use-toast";
import { QuestionCard } from "./interview/QuestionCard";
import { InterviewCard } from "./interview/InterviewCard";

const STORAGE_KEY = 'interview_prep';

interface Question {
  id: string;
  category: string;
  question: string;
  answer: string;
  practiced: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  notes: string;
}

interface Interview {
  id: string;
  company: string;
  role: string;
  date: string;
  stage: string;
  interviewer: string;
  notes: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  outcome: string;
}

interface PrepData {
  questions: Question[];
  interviews: Interview[];
  targetRole: string;
}

const defaultQuestions: Question[] = [
  { id: '1', category: 'behavioral', question: 'Tell me about yourself', answer: '', practiced: false, difficulty: 'easy', notes: '' },
  { id: '2', category: 'behavioral', question: 'Why do you want to work here?', answer: '', practiced: false, difficulty: 'easy', notes: '' },
  { id: '3', category: 'behavioral', question: 'What is your greatest strength?', answer: '', practiced: false, difficulty: 'easy', notes: '' },
  { id: '4', category: 'behavioral', question: 'What is your biggest weakness?', answer: '', practiced: false, difficulty: 'medium', notes: '' },
  { id: '5', category: 'behavioral', question: 'Tell me about a time you failed', answer: '', practiced: false, difficulty: 'medium', notes: '' },
  { id: '6', category: 'behavioral', question: 'Describe a conflict with a coworker', answer: '', practiced: false, difficulty: 'hard', notes: '' },
  { id: '7', category: 'behavioral', question: 'Why are you leaving your current job?', answer: '', practiced: false, difficulty: 'medium', notes: '' },
  { id: '8', category: 'behavioral', question: 'Where do you see yourself in 5 years?', answer: '', practiced: false, difficulty: 'medium', notes: '' },
  { id: '9', category: 'situational', question: 'How do you handle tight deadlines?', answer: '', practiced: false, difficulty: 'medium', notes: '' },
  { id: '10', category: 'situational', question: 'Describe your leadership style', answer: '', practiced: false, difficulty: 'medium', notes: '' },
];

const defaultData: PrepData = { questions: defaultQuestions, interviews: [], targetRole: '' };

const questionCategories = [
  { id: 'behavioral', name: 'Behavioral', icon: MessageSquare },
  { id: 'situational', name: 'Situational', icon: Brain },
  { id: 'technical', name: 'Technical', icon: Star },
  { id: 'company', name: 'Company-Specific', icon: Building },
];

export function InterviewPrep() {
  const { toast } = useToast();
  const [data, setData] = useState<PrepData>(() => loadFromStorage(STORAGE_KEY, defaultData));
  const [activeTab, setActiveTab] = useState('questions');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => { saveToStorage(STORAGE_KEY, data); }, 500);
    return () => clearTimeout(timeout);
  }, [data]);

  const addQuestion = () => {
    const newQ: Question = { id: Date.now().toString(), category: selectedCategory === 'all' ? 'behavioral' : selectedCategory, question: '', answer: '', practiced: false, difficulty: 'medium', notes: '' };
    setData(prev => ({ ...prev, questions: [...prev.questions, newQ] }));
    setExpandedQuestion(newQ.id);
  };

  const updateQuestion = (id: string, field: keyof Question, value: string | boolean) => {
    setData(prev => ({ ...prev, questions: prev.questions.map(q => q.id === id ? { ...q, [field]: value } : q) }));
  };

  const deleteQuestion = (id: string) => {
    setData(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== id) }));
  };

  const addInterview = () => {
    const newI: Interview = { id: Date.now().toString(), company: '', role: data.targetRole || '', date: '', stage: 'Phone Screen', interviewer: '', notes: '', status: 'upcoming', outcome: '' };
    setData(prev => ({ ...prev, interviews: [...prev.interviews, newI] }));
  };

  const updateInterview = (id: string, field: keyof Interview, value: string) => {
    setData(prev => ({ ...prev, interviews: prev.interviews.map(i => i.id === id ? { ...i, [field]: value } : i) }));
  };

  const deleteInterview = (id: string) => {
    setData(prev => ({ ...prev, interviews: prev.interviews.filter(i => i.id !== id) }));
  };

  const handleReset = () => {
    if (confirm('Reset all data? This will clear questions and interviews.')) {
      setData(defaultData);
      clearStorage(STORAGE_KEY);
      toast({ title: "Data cleared" });
    }
  };

  const filteredQuestions = selectedCategory === 'all' ? data.questions : data.questions.filter(q => q.category === selectedCategory);
  const practicedCount = data.questions.filter(q => q.practiced).length;
  const totalQuestions = data.questions.length;
  const upcomingInterviews = data.interviews.filter(i => i.status === 'upcoming').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-teal-600">{practicedCount}/{totalQuestions}</div>
          <div className="text-sm text-teal-700">Questions Practiced</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{Math.round((practicedCount / totalQuestions) * 100) || 0}%</div>
          <div className="text-sm text-blue-700">Completion</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{upcomingInterviews}</div>
          <div className="text-sm text-amber-700">Upcoming Interviews</div>
        </div>
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-violet-600">{data.interviews.length}</div>
          <div className="text-sm text-violet-700">Total Interviews</div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="questions">Practice Questions</TabsTrigger>
            <TabsTrigger value="interviews">Interview Tracker</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={handleReset}>Reset All</Button>
        </div>

        <TabsContent value="questions" className="space-y-4">
          <div className="flex items-center justify-between">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {questionCategories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={addQuestion}><Plus className="w-4 h-4 mr-1" /> Add Question</Button>
          </div>
          <div className="space-y-3">
            {filteredQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                q={q}
                expanded={expandedQuestion === q.id}
                onToggleExpand={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                onUpdate={(field, value) => updateQuestion(q.id, field, value)}
                onDelete={() => deleteQuestion(q.id)}
              />
            ))}
            {filteredQuestions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
                No questions in this category. Click &quot;Add Question&quot; to start.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={addInterview}><Plus className="w-4 h-4 mr-1" /> Add Interview</Button>
          </div>
          <div className="space-y-4">
            {data.interviews.map(interview => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onUpdate={(field, value) => updateInterview(interview.id, field, value)}
                onDelete={() => deleteInterview(interview.id)}
              />
            ))}
            {data.interviews.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
                No interviews tracked yet. Click &quot;Add Interview&quot; to start.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-800 mb-2">STAR Method for Behavioral Questions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-amber-700">
          <div><strong>S</strong>ituation - Set the scene</div>
          <div><strong>T</strong>ask - Your responsibility</div>
          <div><strong>A</strong>ction - What you did</div>
          <div><strong>R</strong>esult - The outcome</div>
        </div>
      </div>
    </div>
  );
}
