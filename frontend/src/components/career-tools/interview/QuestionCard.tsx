"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, CheckCircle, Circle } from "lucide-react";

interface Question {
  id: string;
  category: string;
  question: string;
  answer: string;
  practiced: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  notes: string;
}

const questionCategories = [
  { id: 'behavioral', name: 'Behavioral' },
  { id: 'situational', name: 'Situational' },
  { id: 'technical', name: 'Technical' },
  { id: 'company', name: 'Company-Specific' },
];

interface QuestionCardProps {
  q: Question;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (field: keyof Question, value: string | boolean) => void;
  onDelete: () => void;
}

export function QuestionCard({ q, expanded, onToggleExpand, onUpdate, onDelete }: QuestionCardProps) {
  return (
    <div className={`border rounded-xl overflow-hidden ${q.practiced ? 'bg-emerald-50/50 border-emerald-200' : 'bg-card'}`} data-testid={`question-card-${q.id}`}>
      <div className="p-4 cursor-pointer flex items-start gap-3" onClick={onToggleExpand}>
        <button onClick={(e) => { e.stopPropagation(); onUpdate('practiced', !q.practiced); }} className="mt-0.5">
          {q.practiced ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-gray-300" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-medium">{q.question || 'New Question'}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              q.category === 'behavioral' ? 'bg-blue-100 text-blue-700' :
              q.category === 'situational' ? 'bg-violet-100 text-violet-700' :
              q.category === 'technical' ? 'bg-amber-100 text-amber-700' :
              'bg-teal-100 text-teal-700'
            }`}>{questionCategories.find(c => c.id === q.category)?.name || q.category}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
              q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>{q.difficulty}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3 border-t bg-muted/20">
          <div className="pt-3">
            <Label className="text-xs">Question</Label>
            <Input value={q.question} onChange={e => onUpdate('question', e.target.value)} placeholder="Enter the interview question" />
          </div>
          <div>
            <Label className="text-xs">Your Answer (STAR format recommended)</Label>
            <Textarea value={q.answer} onChange={e => onUpdate('answer', e.target.value)} placeholder={"Situation: ...\nTask: ...\nAction: ...\nResult: ..."} rows={5} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={q.category} onValueChange={v => onUpdate('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {questionCategories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Difficulty</Label>
              <Select value={q.difficulty} onValueChange={v => onUpdate('difficulty', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Textarea value={q.notes} onChange={e => onUpdate('notes', e.target.value)} placeholder="Tips, things to remember..." rows={2} />
          </div>
        </div>
      )}
    </div>
  );
}
