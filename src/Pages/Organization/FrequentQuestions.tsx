
import { List } from "antd"
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchFequentQuestions } from "../../Services/ApiService";

function FrequentQuestions(){

    const { organizationId } = useParams();
    const [questions, setQuestions] = useState<string[]>([])

    const loadQuestions = async (organizationId: string) => {
        const jwt = localStorage.getItem('jwt');
        const content = await fetchFequentQuestions(jwt!, organizationId);

        setQuestions(content.data.questions)
    }

    useEffect(() => {
        loadQuestions(organizationId!!)
    },[])

    return (
        
        <List 
          style={{ marginTop: '5%' }}
          dataSource={questions}
          size="large"
          header={<div>Frequently Asked Questions</div>}
          bordered
          renderItem={(question: string) => (
            <List.Item>
              {question}
            </List.Item>
          )}
        />
      );

}

export default FrequentQuestions