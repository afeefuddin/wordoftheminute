package utils

import (
	"fmt"
	"strings"
	"sync"
)

type MessageBatchMap struct {
	mu    sync.RWMutex
	value map[int64]*MessageBatch
}

type MessageBatch struct {
	mu   sync.RWMutex
	data map[string]int
}

func NewMessageBatchMap() *MessageBatchMap {
	return &MessageBatchMap{
		value: make(map[int64]*MessageBatch),
	}
}

func cleanWord(word string) string {
	word = strings.Replace(word, " ", "", -1)
	word = strings.Replace(word, "\t", "", -1)
	word = strings.Replace(word, "\n", "", -1)
	return word
}

func (mp *MessageBatchMap) Write(word string, timestamp int64) {
	mp.mu.Lock()
	defer mp.mu.Unlock()

	word = cleanWord(word)

	if _, exists := mp.value[timestamp]; !exists {
		mp.value[timestamp] = &MessageBatch{
			data: make(map[string]int),
		}
	}

	mp.value[timestamp].mu.Lock()
	defer mp.value[timestamp].mu.Unlock()
	mp.value[timestamp].data[word]++
}

func (mp *MessageBatchMap) Read(timestamp int64) string {
	mp.mu.RLock()
	defer mp.mu.RUnlock()

	batch, exists := mp.value[timestamp]
	if !exists {
		return ""
	}

	// Generate a string representation of the words in the batch
	batch.mu.RLock()
	defer batch.mu.RUnlock()
	return batch.String()
}

// String generates a comma-separated string of words and their counts from MessageBatch
func (mb *MessageBatch) String() string {
	var parts []string
	for word, count := range mb.data {
		repeatedWord := fmt.Sprintf("%v#%v", word, count)
		parts = append(parts, repeatedWord)
	}
	return strings.Join(parts, ",")
}

// Clear removes the MessageBatch for a specific timestamp
func (mp *MessageBatchMap) Clear(timestamp int64) {
	mp.mu.Lock()
	defer mp.mu.Unlock()
	delete(mp.value, timestamp)
}

// GetBatchSize returns the number of unique words in the batch for a specific timestamp
func (mp *MessageBatchMap) GetBatchSize(timestamp int64) int {
	mp.mu.RLock()
	defer mp.mu.RUnlock()

	batch, exists := mp.value[timestamp]
	if !exists {
		return 0
	}

	batch.mu.RLock()
	defer batch.mu.RUnlock()
	return len(batch.data)
}
