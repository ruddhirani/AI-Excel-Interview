import React, { useState, useEffect } from 'react';
import { User, CheckCircle, Clock, TrendingUp, Award, FileText, Brain, Target, Zap } from 'lucide-react';

const AIExcelInterviewSystem = () => {
  const [phase, setPhase] = useState('introduction');
  const [candidateInfo, setCandidateInfo] = useState({
    name: '',
    email: '',
    position: '',
    experience: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [showReport, setShowReport] = useState(false);

  const questions = [
    {
      id: 1,
      category: 'Foundation',
      difficulty: 'Basic',
      question: "Can you explain the difference between a workbook and a worksheet in Excel? When would you use multiple worksheets?",
      keywords: ['workbook', 'worksheet', 'tabs', 'organize', 'multiple', 'sheets'],
      maxScore: 20
    },
    {
      id: 2,
      category: 'Formulas',
      difficulty: 'Intermediate',
      question: "How would you use VLOOKUP to find data across different sheets? Can you walk me through a practical example?",
      keywords: ['vlookup', 'lookup', 'reference', 'sheets', 'table', 'exact match', 'approximate'],
      maxScore: 25
    },
    {
      id: 3,
      category: 'Data Analysis',
      difficulty: 'Intermediate',
      question: "Describe how you would create a pivot table to analyze sales data by region and month. What insights could this provide?",
      keywords: ['pivot table', 'analyze', 'summarize', 'region', 'month', 'insights', 'data analysis'],
      maxScore: 25
    },
    {
      id: 4,
      category: 'Problem Solving',
      difficulty: 'Advanced',
      question: "You have a dataset with duplicate entries and inconsistent formatting. How would you clean this data efficiently?",
      keywords: ['duplicate', 'clean', 'formatting', 'remove duplicates', 'standardize', 'data quality'],
      maxScore: 25
    },
    {
      id: 5,
      category: 'Advanced Analysis',
      difficulty: 'Advanced',
      question: "How would you use conditional formatting and advanced formulas to create a dynamic dashboard that updates automatically?",
      keywords: ['conditional formatting', 'dashboard', 'dynamic', 'automatic', 'advanced formulas', 'visualization'],
      maxScore: 25
    }
  ];

  const evaluateResponse = (response, question) => {
    const words = response.toLowerCase().split(/\s+/);
    const keywordMatches = question.keywords.filter(keyword => 
      words.some(word => word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word))
    ).length;
    
    const conceptScore = Math.min((keywordMatches / question.keywords.length) * 100, 100);
    const detailScore = Math.min((response.length / 200) * 100, 100);
    const structureScore = response.includes('?') || response.includes('.') ? 80 : 60;
    const exampleScore = response.toLowerCase().includes('example') || 
                        response.toLowerCase().includes('for instance') || 
                        response.toLowerCase().includes('such as') ? 90 : 50;
    
    const totalScore = (conceptScore * 0.4 + detailScore * 0.2 + structureScore * 0.2 + exampleScore * 0.2);
    
    return {
      score: Math.round(totalScore),
      conceptScore: Math.round(conceptScore),
      detailScore: Math.round(detailScore),
      structureScore: Math.round(structureScore),
      exampleScore: Math.round(exampleScore),
      keywordMatches,
      totalKeywords: question.keywords.length
    };
  };

  const handleStartInterview = () => {
    if (candidateInfo.name && candidateInfo.email && candidateInfo.position && candidateInfo.experience) {
      setPhase('interview');
    }
  };

  const handleSubmitResponse = async () => {
    if (!currentResponse.trim()) return;
    
    setIsEvaluating(true);
    
    // Simulate AI evaluation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const evaluation = evaluateResponse(currentResponse, questions[currentQuestion]);
    
    const newResponse = {
      questionId: questions[currentQuestion].id,
      question: questions[currentQuestion].question,
      response: currentResponse,
      evaluation,
      category: questions[currentQuestion].category,
      difficulty: questions[currentQuestion].difficulty
    };
    
    setResponses([...responses, newResponse]);
    setCurrentResponse('');
    setIsEvaluating(false);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      generateFinalReport([...responses, newResponse]);
    }
  };

  const generateFinalReport = (allResponses) => {
    const categoryScores = {};
    const difficultyScores = {};
    
    allResponses.forEach(response => {
      if (!categoryScores[response.category]) {
        categoryScores[response.category] = [];
      }
      if (!difficultyScores[response.difficulty]) {
        difficultyScores[response.difficulty] = [];
      }
      
      categoryScores[response.category].push(response.evaluation.score);
      difficultyScores[response.difficulty].push(response.evaluation.score);
    });
    
    const categoryAverages = {};
    const difficultyAverages = {};
    
    Object.keys(categoryScores).forEach(category => {
      categoryAverages[category] = Math.round(
        categoryScores[category].reduce((a, b) => a + b, 0) / categoryScores[category].length
      );
    });
    
    Object.keys(difficultyScores).forEach(difficulty => {
      difficultyAverages[difficulty] = Math.round(
        difficultyScores[difficulty].reduce((a, b) => a + b, 0) / difficultyScores[difficulty].length
      );
    });
    
    const overallScore = Math.round(
      allResponses.reduce((sum, response) => sum + response.evaluation.score, 0) / allResponses.length
    );
    
    const strengths = [];
    const improvements = [];
    
    Object.entries(categoryAverages).forEach(([category, score]) => {
      if (score >= 75) {
        strengths.push(category);
      } else if (score < 60) {
        improvements.push(category);
      }
    });
    
    const recommendation = overallScore >= 80 ? 'Strong Hire' : 
                          overallScore >= 65 ? 'Hire' : 
                          overallScore >= 50 ? 'Consider' : 'Not Recommended';
    
    setEvaluationResults({
      overallScore,
      categoryAverages,
      difficultyAverages,
      strengths,
      improvements,
      recommendation,
      responses: allResponses
    });
    
    setPhase('report');
  };

  const ScoreBar = ({ score, maxScore = 100, color = 'blue' }) => (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div 
        className={`h-3 rounded-full bg-${color}-500 transition-all duration-500`}
        style={{ width: `${(score / maxScore) * 100}%` }}
      ></div>
    </div>
  );

  const IntroductionPhase = () => (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-100 rounded-full">
            <Brain className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Excel Interview System</h1>
        <p className="text-gray-600">Advanced Technical Assessment Platform</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={candidateInfo.name}
            onChange={(e) => setCandidateInfo({...candidateInfo, name: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={candidateInfo.email}
            onChange={(e) => setCandidateInfo({...candidateInfo, email: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email address"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Position Applied For</label>
          <input
            type="text"
            value={candidateInfo.position}
            onChange={(e) => setCandidateInfo({...candidateInfo, position: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Data Analyst, Financial Analyst"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Years of Excel Experience</label>
          <select
            value={candidateInfo.experience}
            onChange={(e) => setCandidateInfo({...candidateInfo, experience: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select experience level</option>
            <option value="0-1">0-1 years</option>
            <option value="2-3">2-3 years</option>
            <option value="4-5">4-5 years</option>
            <option value="6+">6+ years</option>
          </select>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Interview Process:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 5 progressive technical questions</li>
            <li>• Real-time AI evaluation and feedback</li>
            <li>• Comprehensive performance report</li>
            <li>• Estimated time: 15-20 minutes</li>
          </ul>
        </div>
        
        <button
          onClick={handleStartInterview}
          disabled={!candidateInfo.name || !candidateInfo.email || !candidateInfo.position || !candidateInfo.experience}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Start Technical Interview
        </button>
      </div>
    </div>
  );

  const InterviewPhase = () => {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const currentQ = questions[currentQuestion];
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Technical Assessment</h2>
              <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Progress</div>
              <div className="w-32">
                <ScoreBar score={progress} maxScore={100} color="green" />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentQ.difficulty === 'Basic' ? 'bg-green-100 text-green-800' :
                currentQ.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentQ.difficulty}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {currentQ.category}
              </span>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg text-gray-800 leading-relaxed">{currentQ.question}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <textarea
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              placeholder="Please provide a detailed response with examples where applicable..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isEvaluating}
            />
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {currentResponse.length} characters
              </div>
              <button
                onClick={handleSubmitResponse}
                disabled={!currentResponse.trim() || isEvaluating}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    Submit Response
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {responses.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Previous Responses</h3>
            <div className="space-y-4">
              {responses.map((response, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-gray-700">
                      Q{response.questionId}: {response.category}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-600">
                        {response.evaluation.score}%
                      </span>
                      <div className="w-16">
                        <ScoreBar score={response.evaluation.score} />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{response.response}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ReportPhase = () => (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <Award className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Interview Complete</h1>
          <p className="text-gray-600">Comprehensive Performance Analysis</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {evaluationResults.overallScore}%
            </div>
            <div className="text-gray-700 font-medium">Overall Score</div>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {evaluationResults.recommendation}
            </div>
            <div className="text-gray-700 font-medium">Recommendation</div>
          </div>
          
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {evaluationResults.strengths.length}
            </div>
            <div className="text-gray-700 font-medium">Strong Areas</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Category Performance
          </h3>
          <div className="space-y-4">
            {Object.entries(evaluationResults.categoryAverages).map(([category, score]) => (
              <div key={category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="font-bold text-blue-600">{score}%</span>
                </div>
                <ScoreBar score={score} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Difficulty Analysis
          </h3>
          <div className="space-y-4">
            {Object.entries(evaluationResults.difficultyAverages).map(([difficulty, score]) => (
              <div key={difficulty}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">{difficulty}</span>
                  <span className="font-bold text-blue-600">{score}%</span>
                </div>
                <ScoreBar score={score} />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Key Strengths
          </h3>
          <div className="space-y-2">
            {evaluationResults.strengths.length > 0 ? (
              evaluationResults.strengths.map((strength, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-800 font-medium">{strength}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No standout strengths identified. Focus on building foundational skills.</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Areas for Improvement
          </h3>
          <div className="space-y-2">
            {evaluationResults.improvements.length > 0 ? (
              evaluationResults.improvements.map((improvement, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-800 font-medium">{improvement}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-600">Strong performance across all areas. Continue to build advanced skills.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Detailed Response Analysis
        </h3>
        <div className="space-y-4">
          {evaluationResults.responses.map((response, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">Question {response.questionId}</h4>
                  <p className="text-sm text-gray-600">{response.category} • {response.difficulty}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{response.evaluation.score}%</div>
                  <div className="w-20">
                    <ScoreBar score={response.evaluation.score} />
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3">{response.question}</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded italic mb-3">{response.response}</p>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700">Concepts</div>
                  <div className="text-blue-600">{response.evaluation.conceptScore}%</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Detail</div>
                  <div className="text-blue-600">{response.evaluation.detailScore}%</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Structure</div>
                  <div className="text-blue-600">{response.evaluation.structureScore}%</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Examples</div>
                  <div className="text-blue-600">{response.evaluation.exampleScore}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Download Report
          </button>
          <button className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Schedule Follow-up
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            New Interview
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {phase === 'introduction' && <IntroductionPhase />}
      {phase === 'interview' && <InterviewPhase />}
      {phase === 'report' && <ReportPhase />}
    </div>
  );
};

export default AIExcelInterviewSystem;