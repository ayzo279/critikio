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

def build_clusters(songs, filters):
    n_clusters = max(len(songs)//10, 3)
    defaults = ["tempo","acousticness","key","mode","liveness","loudness","time_signature"]
    for feature in defaults:
        filters[feature] = True
    features = [feature for feature, active in filters.items() if active]

    X = np.array([[song[feature] for feature in features] for song in songs])

    kmeans = KMeans(n_clusters=n_clusters)
    kmeans.fit(X)

    labels = kmeans.labels_

    clusters = [[] for _ in range(n_clusters)]
    for i, label in enumerate(labels):
        clusters[label].append(songs[i])

    return clusters