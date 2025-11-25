import { useState } from 'react'
import { Camera, Upload, Loader2, X, Check } from 'lucide-react'
import Tesseract from 'tesseract.js'

function ReceiptScanner({ people, onItemsExtracted, onClose }) {
  const [image, setImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [items, setItems] = useState([])
  const [progress, setProgress] = useState(0)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target.result)
        processImage(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = async (imageData) => {
    setIsProcessing(true)
    setProgress(0)

    try {
      const result = await Tesseract.recognize(
        imageData,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100))
            }
          }
        }
      )

      const text = result.data.text
      const extractedItems = parseReceiptText(text)
      setItems(extractedItems)
    } catch (error) {
      console.error('OCR Error:', error)
      alert('Failed to process receipt. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const parseReceiptText = (text) => {
    const lines = text.split('\n').filter(line => line.trim())
    const items = []
    
    // Common price patterns: $12.99, 12.99, $12
    const pricePattern = /\$?\d+\.?\d{0,2}/g
    
    lines.forEach(line => {
      // Look for lines that contain both text and a price
      const prices = line.match(pricePattern)
      if (prices && prices.length > 0) {
        // Get the last price on the line (usually the item price)
        const price = parseFloat(prices[prices.length - 1].replace('$', ''))
        
        // Skip if price is too high (likely a total) or too low
        if (price > 0 && price < 500) {
          // Extract item name (everything before the price)
          const itemName = line.split(prices[prices.length - 1])[0].trim()
          
          // Filter out common receipt headers/footers
          const skipWords = ['total', 'subtotal', 'tax', 'tip', 'change', 'cash', 'card', 'thank']
          const shouldSkip = skipWords.some(word => 
            itemName.toLowerCase().includes(word)
          )
          
          if (itemName && !shouldSkip && itemName.length > 2) {
            items.push({
              id: Date.now() + Math.random(),
              name: itemName,
              price: price,
              assignedTo: null
            })
          }
        }
      }
    })
    
    return items
  }

  const assignItem = (itemId, personId) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, assignedTo: personId } : item
    ))
  }

  const handleSubmit = () => {
    // Group items by person
    const itemsByPerson = {}
    let totalAmount = 0
    
    items.forEach(item => {
      if (item.assignedTo) {
        if (!itemsByPerson[item.assignedTo]) {
          itemsByPerson[item.assignedTo] = []
        }
        itemsByPerson[item.assignedTo].push(item)
        totalAmount += item.price
      }
    })
    
    onItemsExtracted(itemsByPerson, totalAmount, items)
  }

  const getPersonName = (id) => {
    return people.find(p => p.id === id)?.name || 'Unknown'
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0).toFixed(2)
  }

  const assignedCount = items.filter(item => item.assignedTo).length

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Camera className="w-6 h-6" />
              Scan Receipt
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Upload a receipt photo to automatically extract items and prices
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!image ? (
            <div className="border-4 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Receipt Photo</h3>
              <p className="text-gray-600 mb-4">
                Take a photo of your receipt or upload an existing image
              </p>
              <label className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                Choose Photo
              </label>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image Preview */}
              <div>
                <h3 className="font-semibold mb-3">Receipt Image</h3>
                <img
                  src={image}
                  alt="Receipt"
                  className="w-full rounded-lg border-2 border-gray-200"
                />
                {isProcessing && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-medium">Processing... {progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Extracted Items</h3>
                  {items.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {assignedCount}/{items.length} assigned
                    </span>
                  )}
                </div>
                
                {items.length === 0 && !isProcessing && (
                  <p className="text-gray-500 text-center py-8">
                    No items detected. Try a clearer photo.
                  </p>
                )}

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-lg font-bold text-purple-600">
                            ${item.price.toFixed(2)}
                          </div>
                        </div>
                        {item.assignedTo && (
                          <Check className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <select
                        value={item.assignedTo || ''}
                        onChange={(e) => assignItem(item.id, parseInt(e.target.value))}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition text-sm"
                      >
                        <option value="">Assign to...</option>
                        {people.map(person => (
                          <option key={person.id} value={person.id}>
                            {person.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {items.length > 0 && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-purple-600">${calculateTotal()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={assignedCount === 0}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Expense ({assignedCount} items)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReceiptScanner
