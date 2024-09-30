from flask import Flask, request, jsonify
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def kmeans(data,k,max_iters,method):
 # Convert data to a NumPy array if it's a list
  if isinstance(data, list):
    data = np.array(data)

    if method == 'random':
        num_points = data.shape[0]
        random_indices = np.random.choice(num_points, k, replace=False)
        centroids = data[random_indices]

    elif method == 'farthest_first':
        num_points = data.shape[0]
        centroids = [data[np.random.randint(num_points)]]
        
        for _ in range(1, k):
            distances = np.array([min(np.linalg.norm(point - centroid) for centroid in centroids) for point in data])
            farthest_index = np.argmax(distances)
            centroids.append(data[farthest_index])
        
        centroids = np.array(centroids)

    elif method == 'kmeans++':
        num_points = data.shape[0]
        centroids = [data[np.random.randint(num_points)]]
        
        for _ in range(1, k):
            distances = np.array([min(np.linalg.norm(point - centroid) for centroid in centroids) for point in data])
            probabilities = distances / distances.sum()
            new_centroid_index = np.random.choice(num_points, p=probabilities)
            centroids.append(data[new_centroid_index])
        
        centroids = np.array(centroids)

    
    cluster_assignments = np.zeros(data.shape[0])
    # Store history of centroids and assignments
    centroids_history = []
    assignments_history = []



    for i in range(max_iters):
        # Store the current centroids and assignments
        centroids_history.append(centroids.copy())  # Append a copy of current centroids
        assignments_history.append(cluster_assignments.copy())  # Append a copy of current assignments
        for idx, point in enumerate(data):
            distances = np.sqrt(np.sum((point - centroids) ** 2, axis=1))  # Euclidean distance
            cluster_assignments[idx] = np.argmin(distances)


        # recalculating new centroids
        new_centroids = np.array([data[cluster_assignments == j].mean(axis=0) for j in range(k)])

        #checking for convergence --> if the centroids stayed the same then stop algorithm
        if np.all(centroids == new_centroids):
            break
            
        centroids = new_centroids  # Update centroids for the next iteration

    # Store the final centroids and assignments
    centroids_history.append(centroids.copy())
    assignments_history.append(cluster_assignments.copy())

    return centroids.tolist(), cluster_assignments.tolist(), centroids_history, assignments_history


  # API endpoint for KMeans clustering
@app.route('/api/kmeans', methods=['POST'])
def run_kmeans():
    request_data = request.get_json()
    data = request_data.get('data')  # Expecting a list of points
    k = request_data.get('k')  # Number of clusters
    max_iters = request_data.get('max_iters', 100)  # Optional: max iterations
    method = request_data.get('method', 'random')


    # Run KMeans algorithm
    centroids, assignments, centroids_history, assignments_history = kmeans(data, k, max_iters, method)

    # Return results as JSON
    return jsonify({
        'centroids': centroids,
        'assignments': assignments,
        'centroids_history': [c.tolist() for c in centroids_history],  # Convert to list for JSON serialization
        'assignments_history': [a.tolist() for a in assignments_history]
    })

@app.route('/api/kmeans/converge', methods=['POST'])
def converge():
    data = request.json['data']
    k = request.json['k']
    method = request.json['method']

    # Implement your kmeans logic here
    centroids, assignments = kmeans(data, k, max_iters=100)  # Assuming your kmeans function is defined
    return jsonify({'centroids': centroids.tolist(), 'assignments': assignments.tolist()})


if __name__ == '__main__':
    app.run(debug=True)