import grpc
from concurrent import futures
import glossary_pb2
import glossary_pb2_grpc
from glossary_data import GLOSSARY_DATA
from flask import Flask, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

class GlossaryService(glossary_pb2_grpc.GlossaryServiceServicer):
    def GetAllTerms(self, request, context):
        term_list = glossary_pb2.TermList()
        for item in GLOSSARY_DATA:
            term = term_list.terms.add()
            term.id = item["id"]
            term.term = item["term"]
            term.definition = item["definition"]
            term.links.extend(item["links"])
        return term_list
    
    def GetTerm(self, request, context):
        term_id = request.id
        for item in GLOSSARY_DATA:
            if item["id"] == term_id:
                term = glossary_pb2.Term()
                term.id = item["id"]
                term.term = item["term"]
                term.definition = item["definition"]
                term.links.extend(item["links"])
                return term
        context.set_code(grpc.StatusCode.NOT_FOUND)
        context.set_details(f"Term with id {term_id} not found")
        return glossary_pb2.Term()
    
    def GetGraph(self, request, context):
        graph = glossary_pb2.Graph()
        
        for item in GLOSSARY_DATA:
            node = graph.nodes.add()
            node.id = item["id"]
            node.label = item["term"]
            node.definition = item["definition"]
        
        for item in GLOSSARY_DATA:
            source_id = item["id"]
            for target_id in item["links"]:
                edge = graph.edges.add()
                edge.source = source_id
                edge.target = target_id
        
        return graph

@app.route('/api/terms', methods=['GET'])
def get_terms():
    return jsonify(GLOSSARY_DATA)

@app.route('/api/graph', methods=['GET'])
def get_graph():
    nodes = []
    edges = []
    
    for item in GLOSSARY_DATA:
        nodes.append({
            "id": item["id"],
            "label": item["term"],
            "definition": item["definition"]
        })
        
        for target_id in item["links"]:
            edges.append({
                "source": item["id"],
                "target": target_id
            })
    
    return jsonify({"nodes": nodes, "edges": edges})

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    glossary_pb2_grpc.add_GlossaryServiceServicer_to_server(GlossaryService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("gRPC server started on port 50051")
    
    app.run(host='0.0.0.0', port=5000, debug=False)

if __name__ == '__main__':
    serve()