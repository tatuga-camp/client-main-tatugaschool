import KanbanBoard from '@/components/googJob/KanbanBoard';
import React, { useMemo } from 'react';

function App() {
    const data = useMemo(() => {
        return [
            { id: 'candidate-1', title: 'John Doe', description: 'Senior Frontend Developer - 5 years experience' },
            { id: 'candidate-2', title: 'Sarah Smith', description: 'Full Stack Engineer - 3 years experience' },
            { id: 'candidate-3', title: 'Mike Johnson', description: 'DevOps Specialist - 4 years experience' },
            { id: 'candidate-4', title: 'Emily Brown', description: 'UI/UX Designer - 6 years experience' },
            { id: 'candidate-5', title: 'David Wilson', description: 'Backend Developer - 4 years experience' },
            { id: 'candidate-6', title: 'Lisa Anderson', description: 'Product Manager - 7 years experience' },
            { id: 'candidate-7', title: 'James Taylor', description: 'Mobile Developer - 3 years experience' },
            { id: 'candidate-8', title: 'Rachel Chen', description: 'Data Engineer - 5 years experience' },
            { id: 'candidate-9', title: 'Alex Martinez', description: 'QA Engineer - 4 years experience' },
            { id: 'candidate-10', title: 'Emma Davis', description: 'System Architect - 8 years experience' }
        ]
    }, []);
    return (
        <div className="App">
            <KanbanBoard data={data} />
        </div>
    );
}

export default App;