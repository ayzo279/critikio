import time
import numpy as np
from sklearn.cluster import KMeans

api_call_count = 0
start_time = time.time()

# Separate larger discographies into 100-track batches to minimize api calls
def batch_process(all_tracks, batch_size = 100):
    return [all_tracks[i:i + batch_size] for i in range(0, len(all_tracks), batch_size)]

def rate_limited_api_call(func, *args, **kwargs):
    global api_call_count, start_time

    # Check the time since the last API call
    current_time = time.time()
    elapsed_time = current_time - start_time

    # If we have hit 20 calls in the current second, wait for the next second
    if api_call_count >= 4:
        time.sleep(1)  # Sleep for the remainder of the second
        # Reset call count and start time for the next second
        api_call_count = 0
        start_time = time.time()

    # Call the actual API function
    api_call_count += 1
    return func(*args, **kwargs)

# Compute normalized Euclidean distance
def compute_similarity(song1, song2, filters: dict[str, bool], weight=2):
    dist = 0
    defaults = ["tempo","acousticness","key","mode","liveness","loudness","time_signature"]

    # Normalize tempo data between 0 and 1, clip in case of outliers
    song2["tempo"] = np.clip(np.interp(song2["tempo"], [0, 200], [0, 1]), 0, 1)

    # Normalize key data 
    song2["key"] = np.interp(song2["key"], [-1, 11], [0, 1])

    # Normalize loudness
    song2["loudness"] = np.clip(np.interp(song2["loudness"], [-60, 0], [0, 1]), 0, 1)

    # Normalize time signatures
    song2["time_signature"] = np.interp(song2["time_signature"], [3, 7], [0, 1])


    # Calculate similarity using default features
    for default_feature in defaults:
        dist += (song1[default_feature] - song2[default_feature]) ** 2

    # Include selected features based on filters, weighted more heavily for user preferences
    for feature in filters.keys():
        if filters[feature]:
            dist += weight * (song1[feature] - song2[feature]) ** 2

    dist = np.sqrt(dist)

    max_dist = np.sqrt(len(defaults) + sum(weight for feature in filters if filters[feature]))

    similarity = 1 - (dist/max_dist)
    return similarity


def build_clusters(songs, filters, n_clusters=3):
    features = [feature for feature, active in filters.items() if active]

    X = np.array([[song[feature] for feature in features] for song in songs])

    kmeans = KMeans(n_clusters=n_clusters)
    kmeans.fit(X)

    labels = kmeans.labels_

    clusters = [[] for _ in range(n_clusters)]
    for i, label in enumerate(labels):
        clusters[label].append(songs[i])

    print(clusters)