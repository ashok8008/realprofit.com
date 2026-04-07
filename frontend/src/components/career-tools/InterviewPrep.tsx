"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, CheckCircle, Circle, Star, Clock, MessageSquare, Building, Brain } from "lucide-react";
import { saveToStorage, loadFromStorage, clearStorage } from "@/lib/career-tools/storage";
import { useToast } from "@/hooks/use-toast";

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

const defaultData: PrepData = {
  questions: defaultQuestions,
  interviews: [],
  targetRole: '',
};

const questionCategories = [
  { id: 'behavioral', name: 'Behavioral', icon: MessageSquare },
  { id: 'situational', name: 'Situational', icon: Brain },
  { id: 'technical', name: 'Technical', icon: Star },
  { id: 'company', name: 'Company-Specific', icon: Building },
];

export function InterviewPrep() {
  const { toast } = useToast();
  const [data, setData] = useState<PrepData>(() => 
    loadFromStorage(STORAGE_KEY, defaultData)
  );
  const [activeTab, setActiveTab] = useState('questions');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Auto-save
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveToStorage(STORAGE_KEY, data);
    }, 500);
    return () => clearTimeout(timeout);
  }, [data]);

  // Questions
  const addQuestion = () => {
    const newQ: Question = {
      id: Date.now().toString(),
      category: selectedCategory === 'all' ? 'behavioral' : selectedCategory,
      question: '',
      answer: '',
      practiced: false,
      difficulty: 'medium',
      notes: '',
    };
    setData(prev => ({ ...prev, questions: [...prev.questions, newQ] }));
    setExpandedQuestion(newQ.id);
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setData(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, [field]: value } : q)
    }));
  };

  const deleteQuestion = (id: string) => {
    setData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  // Interviews
  const addInterview = () => {
    const newI: Interview = {
      id: Date.now().toString(),
      company: '',
      role: data.targetRole || '',
      date: '',
      stage: 'Phone Screen',
      interviewer: '',
      notes: '',
      status: 'upcoming',
      outcome: '',
    };
    setData(prev => ({ ...prev, interviews: [...prev.interviews, newI] }));
  };

  const updateInterview = (id: string, field: keyof Interview, value: string) => {
    setData(prev => ({
      ...prev,
      interviews: prev.interviews.map(i => i.id === id ? { ...i, [field]: value } : i)
    }));
  };

  const deleteInterview = (id: string) => {
    setData(prev => ({
      ...prev,
      interviews: prev.interviews.filter(i => i.id !== id)
    }));
  };

  const handleReset = () => {
    if (confirm('Reset all data? This will clear questions and interviews.')) {
      setData(defaultData);
      clearStorage(STORAGE_KEY);
      toast({ title: "Data cleared" });
    }
  };

  // Filter questions
  const filteredQuestions = selectedCategory === 'all' 
    ? data.questions 
    : data.questions.filter(q => q.category === selectedCategory);

  // Stats
  const practicedCount = data.questions.filter(q => q.practiced).length;
  const totalQuestions = data.questions.length;
  const upcomingInterviews = data.interviews.filter(i => i.status === 'upcoming').length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-teal-600">{practicedCount}/{totalQuestions}</div>
          <div className="text-sm text-teal-700">Questions Practiced</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{Math.round((practicedCount/totalQuestions)*100) || 0}%</div>
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

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {questionCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={addQuestion}>
              <Plus className="w-4 h-4 mr-1" /> Add Question
            </Button>
          </div>

          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => (
              <div 
                key={q.id} 
                className={`border rounded-xl overflow-hidden ${q.practiced ? 'bg-emerald-50/50 border-emerald-200' : 'bg-card'}`}
              >
                <div 
                  className="p-4 cursor-pointer flex items-start gap-3"
                  onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); updateQuestion(q.id, 'practiced', !q.practiced); }}
                    className="mt-0.5"
                  >
                    {q.practiced 
                      ? <CheckCircle className="w-5 h-5 text-emerald-500" />
                      : <Circle className="w-5 h-5 text-gray-300" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{q.question || 'New Question'}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        q.category === 'behavioral' ? 'bg-blue-100 text-blue-700' :
                        q.category === 'situational' ? 'bg-violet-100 text-violet-700' :
                        q.category === 'technical' ? 'bg-amber-100 text-amber-700' :
                        'bg-teal-100 text-teal-700'
                      }`}>
                        {questionCategories.find(c => c.id === q.category)?.name || q.category}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                        q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                {expandedQuestion === q.id && (
                  <div className="px-4 pb-4 pt-0 space-y-3 border-t bg-muted/20">
                    <div className="pt-3">
                      <Label className="text-xs">Question</Label>
                      <Input 
                        value={q.question}
                        onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                        placeholder="Enter the interview question"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Your Answer (STAR format recommended)</Label>
                      <Textarea 
                        value={q.answer}
                        onChange={e => updateQuestion(q.id, 'answer', e.target.value)}
                        placeholder="Situation: ...&#10;Task: ...&#10;Action: ...&#10;Result: ..."
                        rows={5}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Category</Label>
                        <Select value={q.category} onValueChange={v => updateQuestion(q.id, 'category', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {questionCategories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Difficulty</Label>
                        <Select value={q.difficulty} onValueChange={v => updateQuestion(q.id, 'difficulty', v as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Textarea 
                        value={q.notes}
                        onChange={e => updateQuestion(q.id, 'notes', e.target.value)}
                        placeholder="Tips, things to remember..."
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
                No questions in this category. Click "Add Question" to start.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={addInterview}>
              <Plus className="w-4 h-4 mr-1" /> Add Interview
            </Button>
          </div>

          <div className="space-y-4">
            {data.interviews.map(interview => (
              <div 
                key={interview.id} 
                className={`border rounded-xl p-5 ${
                  interview.status === 'upcoming' ? 'bg-amber-50/50 border-amber-200' :
                  interview.status === 'completed' ? 'bg-emerald-50/50 border-emerald-200' :
                  'bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-5 h-5 ${
                      interview.status === 'upcoming' ? 'text-amber-500' :
                      interview.status === 'completed' ? 'text-emerald-500' :
                      'text-gray-400'
                    }`} />
                    <span className={`text-xs font-semibold uppercase ${
                      interview.status === 'upcoming' ? 'text-amber-600' :
                      interview.status === 'completed' ? 'text-emerald-600' :
                      'text-gray-500'
                    }`}>
                      {interview.status}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteInterview(interview.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Company</Label>
                    <Input 
                      value={interview.company}
                      onChange={e => updateInterview(interview.id, 'company', e.target.value)}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Role</Label>
                    <Input 
                      value={interview.role}
                      onChange={e => updateInterview(interview.id, 'role', e.target.value)}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Date</Label>
                    <Input 
                      type="date"
                      value={interview.date}
                      onChange={e => updateInterview(interview.id, 'date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Stage</Label>
                    <Select value={interview.stage} onValueChange={v => updateInterview(interview.id, 'stage', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Phone Screen">Phone Screen</SelectItem>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Behavioral">Behavioral</SelectItem>
                        <SelectItem value="Onsite">Onsite</SelectItem>
                        <SelectItem value="Final">Final</SelectItem>
                        <SelectItem value="Offer">Offer Discussion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Status</Label>
                    <Select value={interview.status} onValueChange={v => updateInterview(interview.id, 'status', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Interviewer</Label>
                    <Input 
                      value={interview.interviewer}
                      onChange={e => updateInterview(interview.id, 'interviewer', e.target.value)}
                      placeholder="Jane Smith, Hiring Manager"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label className="text-xs">Notes / Prep</Label>
                  <Textarea 
                    value={interview.notes}
                    onChange={e => updateInterview(interview.id, 'notes', e.target.value)}
                    placeholder="Company research, questions to ask, things to mention..."
                    rows={2}
                  />
                </div>

                {interview.status === 'completed' && (
                  <div className="mt-4">
                    <Label className="text-xs">Outcome / Feedback</Label>
                    <Textarea 
                      value={interview.outcome}
                      onChange={e => updateInterview(interview.id, 'outcome', e.target.value)}
                      placeholder="How did it go? What feedback did you receive?"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            ))}

            {data.interviews.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
                No interviews tracked yet. Click "Add Interview" to start.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Tips */}
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
